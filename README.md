# Calculadora de Reconstitución de Viales

Una calculadora web sencilla para calcular volúmenes a partir de concentraciones (reconstitución de viales). **Solo matemáticas y conversiones, sin consejos médicos.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Instalación rápida

### Opción 1: npm

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Opción 2: pnpm (recomendado)

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

### Opción 3: yarn

```bash
# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del proyecto

```
vial-calculator/
├── src/
│   ├── app/
│   │   ├── globals.css        # Estilos globales + variables CSS
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   └── tooltip.tsx
│   │   └── VialCalculator.tsx # Componente principal
│   ├── hooks/
│   │   ├── useCalculator.ts   # Lógica de cálculo
│   │   └── useLocalStorage.ts # Persistencia local
│   ├── lib/
│   │   └── utils.ts           # Utilidades (cn)
│   └── types/
│       └── calculator.ts      # Tipos TypeScript
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## ✨ Funcionalidades

### Calculadora Directa
- **Entrada de datos**: Cantidad del vial (mg), diluyente añadido (mL), dosis objetivo (mg/mcg)
- **Resultado en tiempo real**: Concentración final, volumen a extraer en mL y/o unidades U-100
- **Redondeo opcional**: A 1 unidad o 0.5 unidades para jeringas de insulina
- **Dosis real tras redondeo**: Compara objetivo vs real

### Calculadora Inversa
- Introduce mL o unidades U-100 y obtén la dosis equivalente en mg/mcg

### Extras
- **Persistencia**: Los valores se guardan automáticamente en localStorage
- **Copiar resultado**: Genera un texto formateado para el portapapeles
- **Validaciones**: Alertas claras para dosis que superan el vial o volúmenes muy pequeños

## 📐 Fórmulas utilizadas

```typescript
// Concentración: mg/mL = cantidad_vial / volumen_diluyente
mgPerMl = vialMg / diluyenteMl

// Conversión de dosis (si está en mcg)
dosisMg = mcg / 1000

// Volumen necesario
mlNecesarios = dosisMg / mgPerMl

// Equivalencia U-100 (1 mL = 100 unidades)
unidadesU100 = mlNecesarios * 100
```

## 🎨 Stack tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes accesibles basados en Radix UI)
- **Lucide React** (iconos)
- **localStorage** (persistencia local, sin backend)

## 📦 Componentes shadcn/ui incluidos

Los componentes ya están integrados en el proyecto. Si necesitas añadir más componentes shadcn/ui en el futuro:

```bash
# Instalar shadcn/ui CLI (si no está instalado)
npx shadcn@latest init

# Añadir un componente
npx shadcn@latest add [nombre-componente]
```

Componentes actualmente utilizados:
- `card`
- `input`
- `button`
- `select`
- `tabs`
- `toggle-group`
- `alert`
- `separator`
- `tooltip`
- `label`
- `switch`

## 🔧 Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar ESLint
```

## 📱 Diseño responsive

- **Mobile-first**: Una columna con todos los elementos apilados
- **Desktop** (lg+): Dos columnas - entradas a la izquierda, resultado a la derecha

## ♿ Accesibilidad

- Labels explícitos asociados a inputs
- Estados de focus visibles (ring)
- Navegación por teclado
- Roles ARIA en alertas
- Tooltips con información adicional
- Alto contraste en textos

## ⚠️ Disclaimer

> **Calculadora matemática. No sustituye consejo médico.**

Esta herramienta realiza únicamente cálculos matemáticos y conversiones de unidades. No proporciona ni debe interpretarse como consejo médico, farmacológico o de dosificación.

## 📄 Licencia

MIT
