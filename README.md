# 🧵 Nytka — Bespoke Eco-Tailoring Platform

A professional full-stack web application designed for automating bespoke, made-to-measure tailoring workflows. This platform connects customers seeking eco-conscious, custom-sized apparel and home goods with tailoring workshops. Featuring a high-contrast editorial design, an advanced custom measurement engine, and a comprehensive real-time admin dashboard.

---

## Technical Stack & Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, `motion/react` (Framer Motion animations), Lucide Icons, Recharts & D3 (analytics).
- **Backend & Storage**: Node.js, Express, Firebase Firestore (primary database) with a resilient `localStorage` caching and fallback layer.
- **Data Synchronization**: Automated seamless seeding and data sync. If Firestore is connected, local offline drafts, products, and order histories are automatically uploaded and synchronized to prevent any data loss.

---

## Core Features

### 🛍️ Client Storefront
- **Dynamic Catalog**: Category filtering (Apparel, Home Decor, Accessories) and pricing/popularity sorting.
- **Custom Measurement Engine**: Allows selection of standard sizes (S, M, L, XL) or input of custom dimensions (Bust, Waist, Hips, Height) with instant validation.
- **Checkout & Order Dispatch**: Integrated shipping options (Nova Poshta, Courier, Pickup) and secure payment methods (IBAN wire transfer, Cash on Delivery) dynamically managed by the admin.

### 👑 Admin Management Panel
- **Analytical Dashboard**: Interactive D3/Recharts graphs illustrating sales revenue, order volumes, average order value, and product performance.
- **Workflow State Manager**: Real-time order processing pipelines (Pending, Processing, Tailoring, Shipped, Completed) with detailed access to customer-specific measurements.
- **Inventory & Settings Controller**: Instant catalog updates (creating/editing products, sizing, crafting times) and global shop configuration (switching payment active states, contact info).

---

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Serves the full-stack Vite + Express application at [http://localhost:3000](http://localhost:3000).

### 3. Production Build & Start
```bash
npm run build
npm run start
```
Compiles client assets to `/dist` and bundles the Express backend server into `/dist/server.cjs`.

---

# 🧵 Нитка — Платформа екологічного індивідуального пошиву

Професійна full-stack веб-платформа для автоматизації процесів індивідуального пошиву одягу та предметів побуту. Проєкт розроблено для забезпечення взаємодії між клієнтами та кравецькими майстернями. Поєднує мінімалістичний дизайн у стилі етно-модерн, систему розрахунку індивідуальних мірок та повнофункціональну панель адміністрування.

---

## Технологічний стек та архітектура

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, `motion/react` (фізична анімація), Lucide Icons, Recharts & D3 (інтерактивна аналітика).
- **Backend та Сховище**: Node.js, Express, хмарна БД Firebase Firestore з інтегрованим механізмом резервного копіювання у `localStorage`.
- **Синхронізація даних**: Автоматичне завантаження та злиття локальних замовлень і товарів у хмару при першому налаштуванні підключення до Firestore, що повністю унеможливлює втрату даних.

---

## Основний функціонал

### 🛍️ Клієнтський Магазин
- **Каталог з фільтрацією**: Згрупований за категоріями (Одяг, Предмети побуту, Аксесуари) та сортуванням за ціною і популярністю.
- **Конструктор мірок**: Можливість вибору стандартної сітки (S, M, L, XL) або введення точних індивідуальних параметрів (обхват грудей, талії, стегон, зріст).
- **Оформлення замовлень**: Швидкий вибір доставки (Нова Пошта, Самовивіз, Кур'єр) та доступних методів оплати (IBAN реквізити, Накладений платіж).

### 👑 Панель Управління (Адмін-панель)
- **Аналітичний Dashboard**: Візуалізація фінансової статистики, середнього чека та динаміки продажів на графіках Recharts/D3.
- **Контроль замовлень**: Зміна статусів замовлень (Нове, В роботі, Шиється, Надіслано, Виконано) та перегляд точних мірок клієнта для кожного виробу.
- **Керування контентом та налаштуваннями**: Створення й редагування карток товарів, миттєве ввімкнення/вимкнення методів оплати та редагування контактів майстерні.

---

## Швидкий запуск

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Запуск в режимі розробки
```bash
npm run dev
```
Додаток буде доступний за адресою [http://localhost:3000](http://localhost:3000).

### 3. Збірка та запуск в Production
```bash
npm run build
npm run start
```
Клієнтські файли збираються в директорію `/dist`, а Express-сервер компілюється в `/dist/server.cjs`.
