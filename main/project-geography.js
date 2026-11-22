(function initProjectGeography(global) {
    'use strict';

    const CONSTRUCTOR_URL = 'https://yandex.ru/map-widget/v1/?um=constructor%3A550e1b4888ff585ce473f480f7a73f03cd8f793a50bb00bab63be2ee69dca04d&source=constructor';
    const API_BASE_URL = 'https://api-maps.yandex.ru/2.1/';

    const projects = Object.freeze([
        Object.freeze({
            id: 'moscow',
            city: 'Москва',
            type: 'Дата-центр',
            title: 'Гидроизоляция кровли объекта критической инфраструктуры',
            solution: 'Гидроизоляция кровли',
            description: 'Сложные проходки, технологическое оборудование, повышенные требования к герметичности.',
            image: './images/projects-gallery/project-data-center.webp?v=projects-1',
            imageAlt: 'Комплекс зданий дата-центра с плоскими кровлями',
            coordinates: [55.7558, 37.6176],
        }),
        Object.freeze({
            id: 'lipetsk',
            city: 'Липецк',
            type: 'Производство',
            title: 'Ремонт и гидроизоляция государственных объектов',
            solution: 'Ремонт и гидроизоляция',
            description: 'Работы с повышенными требованиями к организации производства.',
            image: './images/projects-gallery/project-production.webp?v=projects-1',
            imageAlt: 'Современный производственный корпус',
            coordinates: [52.6102, 39.5947],
        }),
        Object.freeze({
            id: 'tula',
            city: 'Тула',
            type: 'Складской комплекс',
            title: 'Восстановление кровли после многократных ремонтов',
            solution: 'Комплексное восстановление',
            description: 'Системные протечки и комплексная схема восстановления.',
            image: './images/projects-gallery/project-warehouse.webp?v=projects-1',
            imageAlt: 'Логистический комплекс с погрузочными доками',
            coordinates: [54.193, 37.6178],
        }),
    ]);

    let mapsPromise = null;

    function createApiUrl(apiKey) {
        return `${API_BASE_URL}?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    }

    function isUsableApiKey(apiKey) {
        const normalizedKey = String(apiKey || '').trim();
        return normalizedKey !== '' &&
            !/^(?:your[_-]?api[_-]?key|api[_-]?key|вставьте[_-]?ключ)$/i.test(normalizedKey);
    }

    function loadYandexMaps(apiKey, environment = {}) {
        const documentObject = environment.document || global.document;
        const windowObject = environment.window || global;

        if (windowObject.ymaps) {
            return Promise.resolve(windowObject.ymaps);
        }

        if (mapsPromise) {
            return mapsPromise;
        }

        mapsPromise = new Promise((resolve, reject) => {
            const existingScript = documentObject.querySelector('script[data-yandex-maps-api]');
            const script = existingScript || documentObject.createElement('script');

            const resolveApi = () => {
                if (windowObject.ymaps) {
                    resolve(windowObject.ymaps);
                } else {
                    mapsPromise = null;
                    reject(new Error('Yandex Maps API did not initialize'));
                }
            };

            const rejectApi = () => {
                mapsPromise = null;
                reject(new Error('Yandex Maps API failed to load'));
            };

            script.addEventListener('load', resolveApi, { once: true });
            script.addEventListener('error', rejectApi, { once: true });

            if (!existingScript) {
                script.src = createApiUrl(apiKey);
                script.async = true;
                script.dataset.yandexMapsApi = '';
                documentObject.head.append(script);
            }
        });

        return mapsPromise;
    }

    function createController(root, options = {}) {
        if (!root) {
            return null;
        }

        const documentObject = options.document || global.document;
        const windowObject = options.window || global;
        const mapLoader = options.loadYandexMaps || ((apiKey) => loadYandexMaps(apiKey, {
            document: documentObject,
            window: windowObject,
        }));
        const selectors = Array.from(root.querySelectorAll('[data-project-select]'));
        const mapElement = root.querySelector('[data-project-map]');
        const cardElements = {
            image: root.querySelector('[data-project-image]'),
            city: root.querySelector('[data-project-city]'),
            type: root.querySelector('[data-project-type]'),
            detailType: root.querySelector('[data-project-detail-type]'),
            title: root.querySelector('[data-project-title]'),
            solution: root.querySelector('[data-project-solution]'),
            description: root.querySelector('[data-project-description]'),
        };
        let selectedProjectId = null;
        let mapInstance = null;

        function syncSelectors(projectId) {
            selectors.forEach((selector) => {
                selector.setAttribute('aria-pressed', String(selector.dataset.projectSelect === projectId));
            });
        }

        function selectProject(projectId) {
            const project = projects.find((item) => item.id === projectId);
            if (!project) {
                return false;
            }

            syncSelectors(projectId);
            if (selectedProjectId === projectId) {
                return true;
            }

            cardElements.city.textContent = project.city;
            cardElements.type.textContent = project.type;
            cardElements.detailType.textContent = project.type;
            cardElements.title.textContent = project.title;
            cardElements.solution.textContent = project.solution;
            cardElements.description.textContent = project.description;

            if (cardElements.image.src !== project.image) {
                cardElements.image.src = project.image;
                cardElements.image.alt = project.imageAlt;
            }

            selectedProjectId = projectId;
            return true;
        }

        function renderConstructorMap() {
            if (!mapElement) {
                return;
            }

            const iframe = documentObject.createElement('iframe');
            iframe.src = CONSTRUCTOR_URL;
            iframe.title = 'Карта реализованных проектов ПРУФ';
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            iframe.setAttribute('allowfullscreen', '');
            mapElement.replaceChildren(iframe);
            root.dataset.mapMode = 'constructor';
        }

        function renderApiMap(ymapsApi) {
            if (!mapElement || !ymapsApi || !ymapsApi.Map || !ymapsApi.Placemark) {
                throw new Error('Yandex Maps API is unavailable');
            }

            mapElement.replaceChildren();
            mapInstance = new ymapsApi.Map(mapElement, {
                center: [54.75, 38.65],
                zoom: 6,
                controls: ['zoomControl', 'fullscreenControl'],
            }, {
                suppressMapOpenBlock: true,
            });

            const markerColor = typeof windowObject.getComputedStyle === 'function'
                ? windowObject.getComputedStyle(mapElement).color
                : undefined;

            projects.forEach((project) => {
                const placemark = new ymapsApi.Placemark(project.coordinates, {
                    hintContent: project.city,
                    balloonContentHeader: project.title,
                    balloonContentBody: project.description,
                }, {
                    preset: 'islands#circleDotIcon',
                    iconColor: markerColor,
                });

                placemark.events.add('click', () => selectProject(project.id));
                mapInstance.geoObjects.add(placemark);
            });

            root.dataset.mapMode = 'api';
        }

        function waitUntilReady(ymapsApi) {
            if (!ymapsApi || typeof ymapsApi.ready !== 'function') {
                return Promise.resolve(ymapsApi);
            }

            return new Promise((resolve) => ymapsApi.ready(() => resolve(ymapsApi)));
        }

        function initializeMap() {
            const apiKey = root.dataset.yandexApiKey;
            if (!isUsableApiKey(apiKey)) {
                renderConstructorMap();
                return Promise.resolve('constructor');
            }

            return Promise.resolve(mapLoader(apiKey))
                .then(waitUntilReady)
                .then((ymapsApi) => {
                    renderApiMap(ymapsApi);
                    return 'api';
                })
                .catch(() => {
                    renderConstructorMap();
                    return 'constructor';
                });
        }

        selectors.forEach((selector) => {
            selector.addEventListener('click', () => selectProject(selector.dataset.projectSelect));
        });

        selectProject('moscow');
        if (options.initializeMap !== false) {
            initializeMap();
        }

        return {
            initializeMap,
            renderApiMap,
            renderConstructorMap,
            selectProject,
            getMapInstance: () => mapInstance,
        };
    }

    function initializeAll() {
        global.document.querySelectorAll('[data-project-geography]').forEach((root) => createController(root));
    }

    global.ProofProjectGeography = Object.freeze({
        CONSTRUCTOR_URL,
        createApiUrl,
        createController,
        loadYandexMaps,
        projects,
    });

    if (global.document) {
        if (global.document.readyState === 'loading') {
            global.document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
        } else {
            initializeAll();
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
