# Project Geography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить адаптивный блок географии проектов с картой Конструктора без ключа и кликабельными точками JavaScript API после подстановки ключа.

**Architecture:** HTML хранит доступную структуру блока и единственную точку конфигурации `data-yandex-api-key`. `project-geography.js` владеет данными трёх проектов, состоянием выбранного объекта и двумя адаптерами карты: iframe Конструктора и JavaScript API 2.1. Оба режима используют общую функцию `selectProject(projectId)` для карточки и кнопок городов.

**Tech Stack:** HTML5, CSS/BEM, JavaScript без зависимостей, Яндекс.Карты Constructor iframe, JavaScript API 2.1, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-11-22-project-geography-design.md`

## Global Constraints

- Не изменять `custom/ui.css`, `custom/color.css`, `custom/buttons.css`.
- Использовать существующие переменные цветов и отступов.
- Использовать существующие изображения галереи и SVG-символы `#ui-map-pin`, `#icon_arrow_right_3`.
- Не придумывать площадь, год или другие неподтверждённые характеристики объектов.
- Сохранить несвязанные секции и существующую функциональность.
- Поддержать 1440, 1280, 1024, 768, 576, 375 и 320 px.

## Review Focus

- Пустой или шаблонный API-ключ показывает iframe Конструктора и не ломает карточку.
- Ошибка загрузки внешнего API возвращает резервную карту без необработанного исключения.
- Неизвестный `projectId` не изменяет текущее выбранное состояние.
- Повторный выбор активного объекта не вызывает лишней замены изображения или рассинхронизации `aria-pressed`.
- На 320 px отсутствует горизонтальное переполнение, а управление объектами остаётся доступным с клавиатуры.

---

### Task 1: Разметка и адаптивная композиция

**Files:**
- Modify: `main/index.html`
- Create: `main/project-geography.css`
- Create: `tests/project-geography.test.mjs`

**Interfaces:**
- Consumes: существующие классы `.main-container`, `.button`, токены UI и изображения `main/images/projects-gallery/*.webp`.
- Produces: секция `[data-project-geography]`, контейнер `[data-project-map]`, кнопки `[data-project-select]`, карточка `[data-project-card]` и `data-yandex-api-key=""`.

- [ ] **Step 1: Write the failing markup contract test**

Добавить тест `project geography exposes map, three selectors and a live project card`, проверяющий отдельный CSS/JS, три кнопки с идентификаторами `moscow`, `lipetsk`, `tula`, `aria-pressed`, `aria-live="polite"`, контейнер карты и пустой `data-yandex-api-key`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/project-geography.test.mjs`

Expected: FAIL, секция `.project-geography` отсутствует.

- [ ] **Step 3: Add semantic BEM markup and stylesheet**

Вставить секцию после `.projects-gallery`, подключить `project-geography.css` и `project-geography.js`. Реализовать композицию макета: вступление и CTA, широкая карта, правая тёмная карточка; на мобильных — последовательный стек. Все `margin`, `padding`, `gap` и цвета брать из токенов.

- [ ] **Step 4: Run contract and token tests**

Run: `node --test tests/project-geography.test.mjs tests/design-tokens.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add main/index.html main/project-geography.css tests/project-geography.test.mjs
git commit -m "feat: add project geography layout"
```

### Task 2: Переключение объектов и резервная карта

**Files:**
- Create: `main/project-geography.js`
- Modify: `tests/project-geography.test.mjs`

**Interfaces:**
- Consumes: DOM-контракт Task 1.
- Produces: `selectProject(projectId: string): boolean`, `renderConstructorMap(): void`, единый массив `projects` с тремя объектами.

- [ ] **Step 1: Write failing interaction tests**

Добавить тесты: первый объект активен; клик по `lipetsk` обновляет город, тип, заголовок, описание, изображение и `aria-pressed`; неизвестный ID возвращает `false`; повторный выбор текущего ID сохраняет корректное состояние; пустой ключ вызывает `renderConstructorMap()` с предоставленным `constructor` URL.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/project-geography.test.mjs`

Expected: FAIL, `project-geography.js` и функции отсутствуют.

- [ ] **Step 3: Implement project state and fallback adapter**

Создать данные `moscow`, `lipetsk`, `tula` из текущей галереи. Реализовать `selectProject`, обработчики кнопок, короткое состояние перехода карточки и `renderConstructorMap` с iframe URL `https://yandex.ru/map-widget/v1/?um=constructor%3A550e1b4888ff585ce473f480f7a73f03cd8f793a50bb00bab63be2ee69dca04d&source=constructor`.

- [ ] **Step 4: Add accessibility and reduced-motion behavior**

Синхронизировать `aria-pressed`, сохранить доступное имя карты, не переносить фокус при автоматическом обновлении, отключить визуальный переход при `prefers-reduced-motion`.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/project-geography.test.mjs tests/design-tokens.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add main/project-geography.js main/project-geography.css tests/project-geography.test.mjs
git commit -m "feat: switch geography project cards"
```

### Task 3: Яндекс.Карты API и итоговая проверка

**Files:**
- Modify: `main/project-geography.js`
- Modify: `tests/project-geography.test.mjs`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: `selectProject(projectId)` и данные проектов Task 2.
- Produces: `loadYandexMaps(apiKey: string): Promise<void>`, `renderApiMap(ymapsApi: object): void`, кликабельные точки и автоматический fallback.

- [ ] **Step 1: Write failing API adapter tests**

Добавить тесты: настоящий ключ формирует URL API 2.1 с `apikey` и `lang=ru_RU`; заглушка `ymaps` получает три точки; событие `click` точки `tula` вызывает `selectProject('tula')`; rejection загрузки вызывает резервный режим.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/project-geography.test.mjs`

Expected: FAIL, API-адаптер отсутствует.

- [ ] **Step 3: Implement lazy API loading and map adapter**

Реализовать `loadYandexMaps` с единственным script-тегом и Promise. После `ymaps.ready` создать карту России, три `Placemark` с подтверждёнными координатами городов и обработчиками `click`. Цвет меток получить из вычисленного CSS-цвета блока, не дублируя значение вручную.

- [ ] **Step 4: Implement automatic fallback**

Любая ошибка загрузки, отсутствие `window.ymaps` или исключение инициализации вызывает `renderConstructorMap()` и сохраняет рабочие кнопки/карточку.

- [ ] **Step 5: Run all automated checks**

Run: `node --check main/project-geography.js && node --test tests/*.mjs && git diff --check`

Expected: синтаксис корректен, все тесты PASS, diff без ошибок.

- [ ] **Step 6: Run visual and interaction QA**

В локальном браузере проверить 1440, 1280, 1024, 768, 576, 375 и 320 px; fallback без ключа; кнопки городов; заглушку API с кликом по точке; клавиатуру; отсутствие горизонтального переполнения и консольных ошибок. Сравнить с исходным макетом и записать `design-qa.md` с `final result: passed`.

- [ ] **Step 7: Verify protected files**

Сравнить хеши `custom/ui.css`, `custom/color.css`, `custom/buttons.css` с состоянием перед началом Task 1; они должны совпасть.

- [ ] **Step 8: Commit**

```bash
git add main/project-geography.js tests/project-geography.test.mjs design-qa.md
git commit -m "feat: connect geography map points"
```
