// Avatares predefinidos (ficheros en public/avatar/).
// url null = avatar por defecto (blue-worm), igual que ProfileUser.avatarUrl.
export interface GalleryAvatar {
  label: string
  url: string | null
}

export const AVATAR_GALLERY: GalleryAvatar[] = [
  { label: 'Blue worm (default)', url: null },
  { label: 'Red worm', url: '/avatar/red-worm.png' },
]