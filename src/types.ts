export type Step = 'camera' | 'avatar' | 'editor' | 'export';

export type CategoryId = 
  | 'all'
  | 'superhero'
  | 'royal'
  | 'astronaut'
  | 'scientist'
  | 'teacher'
  | 'doctor'
  | 'athlete'
  | 'footballer'
  | 'firefighter'
  | 'traditional'
  | 'explorer'
  | 'fantasy';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  color: string;
}

export interface FaceHoleSpec {
  cx: number;        // Center X coordinate in 600x900 coordinate space
  cy: number;        // Center Y coordinate
  rx: number;        // Horizontal radius of oval
  ry: number;        // Vertical radius of oval
  rotate?: number;    // Oval slight tilt in degrees
}

export interface AvatarItem {
  id: string;
  name: string;
  category: CategoryId;
  gender: 'lelaki' | 'perempuan' | 'unisex';
  roleTitle: string;
  badgeText: string;
  themeColor: string;
  description: string;
  faceHole: FaceHoleSpec;
  // SVG drawing function or raw markup string
  svgForeground: string; // The character body, clothing, hat rim, hands, accessories
  svgHairBack?: string;  // Optional back hair or cape behind head
}

export interface FaceTransform {
  scale: number;       // default 1.0 (range 0.4 to 2.5)
  offsetX: number;     // delta X in canvas units (-250 to 250)
  offsetY: number;     // delta Y in canvas units (-250 to 250)
  rotation: number;    // degrees (-45 to +45)
  flipH: boolean;      // flip horizontally
  brightness: number;  // 80 to 140 (%)
  contrast: number;    // 80 to 140 (%)
  removeBackground: boolean; // Auto remove background of photo
  bgFeather: number;   // Feathered edge smoothing (px)
}

export type BackgroundPattern = 
  | 'solid'
  | 'stars'
  | 'stripes'
  | 'dots'
  | 'sunburst'
  | 'clouds'
  | 'sparkles';

export interface BackgroundOption {
  id: string;
  name: string;
  bgColor: string;
  pattern: BackgroundPattern;
  patternColor?: string;
  gradient?: string;
}

export type FrameType = 
  | 'none'
  | 'gold'
  | 'rainbow'
  | 'polaroid'
  | 'comic'
  | 'stars';

export interface FrameOption {
  id: FrameType;
  name: string;
  color: string;
  previewClass: string;
}

export interface TextCustomization {
  userName: string;
  showUserName: boolean;
  nameColor: string;
  nameSize: number;
  
  sloganText: string;
  showSlogan: boolean;
  sloganColor: string;
  sloganBgColor: string;
  
  bannerStyle: 'curved' | 'ribbon' | 'badge' | 'simple';
}

export interface EditorSettings {
  avatarId: string;
  faceTransform: FaceTransform;
  background: BackgroundOption;
  frame: FrameType;
  text: TextCustomization;
}

export type PrintLayoutMode = 'single_full' | 'dual_medium' | 'quad_sticker';

export interface SavedAvatarRecord {
  id: string;
  created_at: string;
  student_name: string;
  class_name?: string;
  avatar_id: string;
  avatar_name: string;
  avatar_category: string;
  slogan_text?: string;
  image_data: string; // Base64 data URL
  frame_type?: string;
  sync_status?: 'synced' | 'local_only' | 'syncing';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  isConnected: boolean;
}
