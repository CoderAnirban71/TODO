import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, props: P) => ({
  viewBox: '0 0 20 20',
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconSearch = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M13 13l4 4" />
  </svg>
)
export const IconEdit = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M13.5 3.5l3 3L7 16H4v-3z" />
  </svg>
)
export const IconTrash = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 6h12M8 6V4h4v2M6 6l.8 10h6.4L14 6" />
  </svg>
)
export const IconSun = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="10" cy="10" r="4" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" />
  </svg>
)
export const IconMoon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M16 12.5A7 7 0 0 1 7.5 4a7 7 0 1 0 8.5 8.5z" />
  </svg>
)
export const IconFocus = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="10" cy="10" r="7" />
    <circle cx="10" cy="10" r="2.5" fill="currentColor" stroke="none" />
    <path d="M10 3v2M10 15v2M3 10h2M15 10h2" />
  </svg>
)
export const IconCalendar = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="3" y="4" width="14" height="13" rx="2" />
    <path d="M3 8h14M7 2.5v3M13 2.5v3" />
  </svg>
)
export const IconTag = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M3 3h6l8 8-6 6-8-8z" />
    <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
)
export const IconNotes = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 4h12v12H4zM7 8h6M7 11h4" />
  </svg>
)
export const IconList = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 5h12M4 10h12M4 15h12" />
  </svg>
)
export const IconBoard = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="3" y="3" width="4" height="14" rx="1" />
    <rect x="8" y="3" width="4" height="10" rx="1" />
    <rect x="13" y="3" width="4" height="7" rx="1" />
  </svg>
)
export const IconClose = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
)
export const IconPlay = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 4l10 6-10 6z" fill="currentColor" />
  </svg>
)
export const IconPause = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 4v12M14 4v12" strokeWidth="2.4" />
  </svg>
)
export const IconCheck = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 10.5l4 4 8-9" strokeWidth="2.2" />
  </svg>
)
export const IconCommand = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M7 7V5a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v10a2 2 0 1 0 2-2H5a2 2 0 1 0 2 2z" />
  </svg>
)
export const IconGrip = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)} stroke="none" fill="currentColor">
    <circle cx="7" cy="5" r="1.4" />
    <circle cx="13" cy="5" r="1.4" />
    <circle cx="7" cy="10" r="1.4" />
    <circle cx="13" cy="10" r="1.4" />
    <circle cx="7" cy="15" r="1.4" />
    <circle cx="13" cy="15" r="1.4" />
  </svg>
)
export const IconSparkle = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M10 2l1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8z" fill="currentColor" stroke="none" />
  </svg>
)
export const IconDownload = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M10 3v10M6 9l4 4 4-4M4 16h12" />
  </svg>
)
export const IconUpload = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M10 13V3M6 7l4-4 4 4M4 16h12" />
  </svg>
)
export const IconKeyboard = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="2" y="5" width="16" height="10" rx="2" />
    <path d="M5 8h1M8 8h1M11 8h1M14 8h1M5 11h1M8 11h4M14 11h1" />
  </svg>
)
export const IconFlag = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 17V3h9l-2 3.5L14 10H5" />
  </svg>
)
