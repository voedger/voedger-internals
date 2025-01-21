// ngx_http_crc32_module.c

#include <ngx_config.h>
#include <ngx_core.h>
#include <ngx_http.h>
#include <zlib.h>  // Для CRC32
#include <netdb.h>
#include <arpa/inet.h>
#include <pthread.h>

static ngx_array_t *backend_ips = NULL;
static pthread_mutex_t ips_mutex = PTHREAD_MUTEX_INITIALIZER;

// Прототипы функций
static char *ngx_http_crc32_proxy(ngx_conf_t *cf, ngx_command_t *cmd, void *conf);
static ngx_int_t ngx_http_crc32_proxy_handler(ngx_http_request_t *r);
static ngx_int_t ngx_http_crc32_init(ngx_conf_t *cf);
static void *ngx_http_crc32_create_loc_conf(ngx_conf_t *cf);
static char *ngx_http_crc32_merge_loc_conf(ngx_conf_t *cf, void *parent, void *child);
static void *ngx_http_crc32_create_main_conf(ngx_conf_t *cf);

// Структура конфигурации
typedef struct {
    ngx_str_t service_name;
} ngx_http_crc32_main_conf_t;

// Директивы модуля
static ngx_command_t ngx_http_crc32_commands[] = {
    {
        ngx_string("crc32_proxy"),
        NGX_HTTP_LOC_CONF|NGX_CONF_NOARGS,
        ngx_http_crc32_proxy,
        NGX_HTTP_LOC_CONF_OFFSET,
        0,
        NULL
    },
    ngx_null_command
};

// Контекст модуля
static ngx_http_module_t ngx_http_crc32_module_ctx = {
    NULL,                                  /* preconfiguration */
    ngx_http_crc32_init,                   /* postconfiguration */

    ngx_http_crc32_create_main_conf,       /* create main configuration */
    NULL,                                  /* init main configuration */

    NULL,                                  /* create server configuration */
    NULL,                                  /* merge server configuration */

    ngx_http_crc32_create_loc_conf,        /* create location configuration */
    ngx_http_crc32_merge_loc_conf          /* merge location configuration */
};

// Определение модуля
ngx_module_t ngx_http_crc32_module = {
    NGX_MODULE_V1,
    &ngx_http_crc32_module_ctx,            /* module context */
    ngx_http_crc32_commands,               /* module directives */
    NGX_HTTP_MODULE,                       /* module type */
    NULL,                                  /* init master */
    NULL,                                  /* init module */
    NULL,                                  /* init process */
    NULL,                                  /* init thread */
    NULL,                                  /* exit thread */
    NULL,                                  /* exit process */
    NULL,                                  /* exit master */
    NGX_MODULE_V1_PADDING
};

// Функция для загрузки IP-адресов из DNS
static ngx_int_t load_backend_ips(ngx_cycle_t *cycle) {
    struct addrinfo hints, *res, *p;
    int status;
    char ipstr[INET_ADDRSTRLEN];

    ngx_http_crc32_main_conf_t *mcf = ngx_http_cycle_get_module_main_conf(cycle, ngx_http_crc32_module);
    if (mcf == NULL) {
        ngx_log_error(NGX_LOG_ERR, cycle->log, 0, "Failed to get main conf");
        return NGX_ERROR;
    }

    const char *service_name = (char *)mcf->service_name.data;

    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_INET; // Используем IPv4
    hints.ai_socktype = SOCK_STREAM;

    status = getaddrinfo(service_name, NULL, &hints, &res);
    if (status != 0) {
        ngx_log_error(NGX_LOG_ERR, cycle->log, 0, "getaddrinfo: %s", gai_strerror(status));
        return NGX_ERROR;
    }

    ngx_array_t *new_backend_ips = ngx_array_create(cycle->pool, 6, sizeof(ngx_str_t));
    if (new_backend_ips == NULL) {
        freeaddrinfo(res);
        return NGX_ERROR;
    }

    for (p = res; p != NULL; p = p->ai_next) {
        void *addr;
        struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
        addr = &(ipv4->sin_addr);

        // Конвертируем IP в строку
        inet_ntop(p->ai_family, addr, ipstr, sizeof ipstr);

        ngx_str_t *ip = ngx_array_push(new_backend_ips);
        if (ip == NULL) {
            freeaddrinfo(res);
            return NGX_ERROR;
        }
        ip->len = ngx_strlen(ipstr);
        ip->data = ngx_pnalloc(cycle->pool, ip->len);
        if (ip->data == NULL) {
            freeaddrinfo(res);
            return NGX_ERROR;
        }
        ngx_memcpy(ip->data, ipstr, ip->len);
    }

    freeaddrinfo(res);

    // Обновляем глобальный массив IP-адресов
    pthread_mutex_lock(&ips_mutex);
    backend_ips = new_backend_ips;
    pthread_mutex_unlock(&ips_mutex);

    return NGX_OK;
}

// Функция периодического обновления IP-адресов
static void *dns_update_thread(void *arg) {
    ngx_cycle_t *cycle = (ngx_cycle_t *)arg;
    while (1) {
        if (load_backend_ips(cycle) != NGX_OK) {
            ngx_log_error(NGX_LOG_ERR, cycle->log, 0, "Failed to load backend IPs");
        }
        sleep(30); // Обновляем каждые 30 секунд
    }
    return NULL;
}

// Инициализация модуля
static ngx_int_t ngx_http_crc32_init(ngx_conf_t *cf) {
    ngx_cycle_t *cycle = cf->cycle;

    // Загружаем IP-адреса при старте
    if (load_backend_ips(cycle) != NGX_OK) {
        return NGX_ERROR;
    }

    // Запускаем поток для обновления IP-адресов
    pthread_t tid;
    if (pthread_create(&tid, NULL, dns_update_thread, cycle) != 0) {
        ngx_log_error(NGX_LOG_ERR, cycle->log, 0, "Failed to create DNS update thread");
        return NGX_ERROR;
    }

    return NGX_OK;
}

// Обработчик запроса
static ngx_int_t ngx_http_crc32_proxy_handler(ngx_http_request_t *r) {
    ngx_str_t uri, id;
    u_char *p, *end;
    uLong crc;
    ngx_uint_t index;
    ngx_str_t *ip_list;
    ngx_uint_t ip_count;

    // Обрабатываем только GET и POST запросы
    if (!(r->method & (NGX_HTTP_GET|NGX_HTTP_POST))) {
        return NGX_HTTP_NOT_ALLOWED;
    }

    // Получаем URI запроса
    uri = r->uri;
    end = uri.data + uri.len;

    // Проверяем, что URI начинается с "/api/"
    ngx_str_t prefix = ngx_string("/api/");
    if (uri.len < prefix.len || ngx_strncmp(uri.data, prefix.data, prefix.len) != 0) {
        return NGX_HTTP_BAD_REQUEST;
    }

    // Парсим URI, чтобы извлечь id (последний сегмент)
    p = uri.data + prefix.len;  // Пропускаем "/api/"
    while (p < end && *p != '/') p++;  // Пропускаем owner
    while (p < end && *p != '/') p++;  // Пропускаем app-name
    p++;  // Переходим к id
    id.data = p;
    id.len = end - p;

    if (id.len == 0) {
        return NGX_HTTP_BAD_REQUEST;
    }

    // Вычисляем хэш CRC32 от id
    crc = crc32(0L, Z_NULL, 0);
    crc = crc32(crc, id.data, id.len);

    // Получаем IP-адреса из массива
    pthread_mutex_lock(&ips_mutex);
    if (backend_ips == NULL || backend_ips->nelts == 0) {
        pthread_mutex_unlock(&ips_mutex);
        return NGX_HTTP_INTERNAL_SERVER_ERROR;
    }
    ip_list = backend_ips->elts;
    ip_count = backend_ips->nelts;
    index = crc % ip_count;
    ngx_str_t backend_ip = ip_list[index];
    pthread_mutex_unlock(&ips_mutex);

    // Формируем backend_url
    ngx_str_t backend_url;
    backend_url.len = sizeof("http://") - 1 + backend_ip.len;
    backend_url.data = ngx_pnalloc(r->pool, backend_url.len);
    if (backend_url.data == NULL) {
        return NGX_HTTP_INTERNAL_SERVER_ERROR;
    }

    u_char *q = backend_url.data;
    q = ngx_cpymem(q, "http://", sizeof("http://") - 1);
    q = ngx_cpymem(q, backend_ip.data, backend_ip.len);

    // Проксируем запрос
    ngx_http_internal_redirect(r, &backend_url, &r->args);
    ngx_http_finalize_request(r, NGX_DONE);

    return NGX_DONE;
}

// Функция настройки директивы crc32_proxy
static char *ngx_http_crc32_proxy(ngx_conf_t *cf, ngx_command_t *cmd, void *conf) {
    ngx_http_core_loc_conf_t *clcf;

    // Получаем конфигурацию локации
    clcf = ngx_http_conf_get_module_loc_conf(cf, ngx_http_core_module);

    // Устанавливаем обработчик
    clcf->handler = ngx_http_crc32_proxy_handler;

    return NGX_CONF_OK;
}

// Создание конфигурации локации
static void *ngx_http_crc32_create_loc_conf(ngx_conf_t *cf) {
    return NGX_CONF_OK;
}

// Слияние конфигураций локаций
static char *ngx_http_crc32_merge_loc_conf(ngx_conf_t *cf, void *parent, void *child) {
    return NGX_CONF_OK;
}

// Создание конфигурации main
static void *ngx_http_crc32_create_main_conf(ngx_conf_t *cf) {
    ngx_http_crc32_main_conf_t *conf;

    conf = ngx_pcalloc(cf->pool, sizeof(ngx_http_crc32_main_conf_t));
    if (conf == NULL) {
        return NULL;
    }

    // Исправлено использование ngx_string
    conf->service_name.len = sizeof("tasks.app") - 1;
    conf->service_name.data = (u_char *) "tasks.app";

    return conf;
}
