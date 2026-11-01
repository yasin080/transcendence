// Preset avatars (files in public/avatar/).
// url null = default avatar (blue-worm).

export interface GalleryAvatar {
  label: string
  url: string | null
}

export const AVATAR_GALLERY: GalleryAvatar[] = [
  { label: 'Blue worm (default)', url: null },
  { label: 'Red worm', url: '/avatar/red-worm.png' },
]