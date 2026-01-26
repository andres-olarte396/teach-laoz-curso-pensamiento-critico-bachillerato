export interface MenuItemDto {
  id: string;
  title: string;
  path: string;
  type: 'directory' | 'markdown' | 'html' | 'binary' | 'evaluation';
  order?: number;
  children?: MenuItemDto[];
}

export interface MenuDto {
  courses: MenuItemDto[];
}
