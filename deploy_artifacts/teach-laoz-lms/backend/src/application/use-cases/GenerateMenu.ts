import { IContentRepository } from '../../domain/repositories/IContentRepository.js';
import { MenuDto, MenuItemDto } from '../dtos/MenuDto.js';
import { ContentNode } from '../../domain/entities/ContentNode.js';

export class GenerateMenu {
  private cachedMenu: MenuDto | null = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(): Promise<MenuDto> {
    if (this.cachedMenu && (Date.now() - this.lastCacheTime < this.CACHE_TTL)) {
       return this.cachedMenu;
    }

    const rootNodes = await this.contentRepository.list('');
    
    // We filter only directories at root as "courses", excluding specific restricted ones like "blog"
    const courses = (await Promise.all(
      rootNodes
        .filter(node => node.isDirectory() && node.name.toLowerCase() !== 'blog')
        .map(async courseNode => this.buildMenuItem(courseNode))
    )).filter((item): item is MenuItemDto => item !== null);

    const menu = { courses };
    this.cachedMenu = menu;
    this.lastCacheTime = Date.now();

    return menu;
  }

  private async buildMenuItem(node: ContentNode): Promise<MenuItemDto | null> {
    const path = node.path.toString();
    const isDirectory = node.isDirectory();
    
    const item: MenuItemDto = {
      id: node.name,
      title: this.formatTitle(node.name, false),
      path,
      type: isDirectory ? 'directory' : (node.name.toLowerCase().includes('evaluacion') ? 'evaluation' : node.type as any),
    };

    if (isDirectory) {
      const childrenNodes = await this.contentRepository.list(path);
      
      const childrenPromises = childrenNodes
        .filter(n => {
          if (n.isDirectory()) return true;
          if (n.isMarkdown()) return true;
          if (n.isHtml()) return true;
          // Allow specific binary assets
          const allowedExtensions = ['pdf', 'mp4', 'mp3', 'wav', 'ogg', 'm4a', 'png', 'jpg', 'jpeg', 'svg'];
          return n.isBinary() && allowedExtensions.includes(n.extension?.toLowerCase() || '');
        })
        .map(n => this.buildMenuItem(n));

      const children = (await Promise.all(childrenPromises))
        .filter((child): child is MenuItemDto => child !== null);
      
      if (children.length === 0) {
        return null;
      }

      item.children = await this.groupChildren(children);
    }

    return item;
  }

  private formatTitle(name: string, skipExtensionRemoval: boolean = false): string {
    // 1. Remove extension (only if configured, usually for files)
    let title = name;
    if (!skipExtensionRemoval) {
        title = name.replace(/\.[^/.]+$/, "");
    }
    
    // 2. Aggressive multi-pass cleaning of prefixes at the start
    // Removes any combination of "teach", "laoz", "curso" and common separators at the beginning
    const originalTitle = title;
    let prevTitle;
    do {
      prevTitle = title;
      title = title.replace(/^(teach|laoz|curso|learning|system|courses?|educacion|communication|[ ._-]+)/i, "").trim();
    } while (title !== prevTitle && title.length > 0);
    
    // Fallback if cleaning removed everything
    if (title.length === 0) {
        title = originalTitle;
    }
    
    // 3. Replace remaining separators with spaces
    title = title.replace(/[._-]/g, " ");

    // 4. Title Case
    return title.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).trim();
  }

  private async groupChildren(children: MenuItemDto[]): Promise<MenuItemDto[]> {
    const groups = new Map<string, MenuItemDto[]>();
    const ungrouped: MenuItemDto[] = [];
    
    // Regex to identify resources matches: prefix + separator + type + optional suffix + optional extension
    // We use non-greedy matching (.*?) for suffix to allow the extension group to capture the end if present.
    const resourceRegex = /^(.*?)[-_](contenido|ejercicios?|evaluacion|guion|extra|presentacion|nivelacion|video|ilustracion|bugs|estrategias|infografia|mindmap|manual|heuristicos|fallos|intro|simulacion|casos|proyecto|sesgos|manipulacion)(?:[-_](.*?))?(?:\.[a-z0-9]+)?$/i;

    children.forEach(child => {
      const match = child.id.match(resourceRegex);
      if (match) {
        const prefix = match[1];
        if (!groups.has(prefix)) {
          groups.set(prefix, []);
        }
        groups.get(prefix)?.push(child);
      } else {
        ungrouped.push(child);
      }
    });

    // Prepare final items list
    const finalItems: MenuItemDto[] = [];
    const handledPrefixes = new Set<string>();

    for (const child of children) {
      const match = child.id.match(resourceRegex);
      if (match) {
        const prefix = match[1];
        
        if (handledPrefixes.has(prefix)) continue; // Already added this group

        const groupItemList = groups.get(prefix);
        if (groupItemList) {
             let groupTitle = this.formatTitle(prefix, true);
             let titleSourceFile = null;

             // Find content node to extract title (prioritize 'contenido', but if single item, use that item)
             if (groupItemList.length === 1) {
                 titleSourceFile = groupItemList[0];
             } else {
                 titleSourceFile = groupItemList.find(c => c.id.toLowerCase().includes('contenido'));
             }

             if (titleSourceFile) {
                 try {
                     const fileContent = await this.contentRepository.getFile(titleSourceFile.path);
                     if (typeof fileContent === 'string') {
                         const h1Match = fileContent.match(/^#\s+(.+)$/m);
                         if (h1Match) {
                             groupTitle = h1Match[1].trim();
                         }
                     }
                 } catch (e) {
                     // Silently fail and use formatted title
                 }
             }

             if (groupItemList.length === 1) {
                 // FLATTEN: Return the single item directly, but with the specific Group Title (H1)
                 // This effectively "removes the number/prefix" for the user interface
                 // and avoids a useless folder wrapper.
                 const singleItem = groupItemList[0];
                 finalItems.push({
                     ...singleItem,
                     title: groupTitle // Overwrite title (e.g. "Presentación" or "Círculos Perfectos")
                 });
             } else {
                 // GROUP: Create folder
                 const groupItem: MenuItemDto = {
                   id: prefix,
                   title: groupTitle,
                   path: '#', // Not directly navigable
                   type: 'directory',
                   children: groupItemList.map(c => this.renameResourceItem(c, resourceRegex))
                 };
                 finalItems.push(groupItem);
             }
             
             handledPrefixes.add(prefix);
        } else {
            // Should not happen logic-wise if match worked
             finalItems.push(child);
        }
      } else {
        finalItems.push(child);
      }
    }

    return finalItems;
  }

  private renameResourceItem(item: MenuItemDto, regex: RegExp): MenuItemDto {
     const match = item.id.match(regex);
     if (!match) return item;

     const type = match[2].toLowerCase();
     const suffix = match[3]; // Captured suffix group (if any)
     let newTitle = item.title;

     // Normalized checking for singular/plural
     const typeKey = type.startsWith('ejercicio') ? 'ejercicios' : type;

     switch(typeKey) {
         case 'contenido': newTitle = 'Contenido'; break;
         case 'ejercicios': newTitle = 'Ejercicios'; break;
         case 'evaluacion': newTitle = 'Evaluación'; break;
         case 'guion': newTitle = 'Guión'; break;
         case 'presentacion': newTitle = 'Presentación'; break;
         case 'extra': newTitle = 'Material Extra'; break;
         case 'nivelacion': newTitle = 'Nivelación'; break;
         case 'video': newTitle = 'Video'; break;
         case 'ilustracion': newTitle = 'Ilustración'; break;
         case 'intro': newTitle = 'Intro'; break;
         case 'simulacion': newTitle = 'Simulación'; break;
         case 'sesgos': newTitle = 'Sesgos'; break;
         case 'manipulacion': newTitle = 'Manipulación'; break;
         default: 
            // For general topics like 'bugs', 'estrategias', allow formatting
            // AND append suffix if present (e.g. 'Bugs' + ' ' + 'Cerebrales')
            newTitle = this.formatTitle(type, true);
     }

     if (suffix) {
         const formattedSuffix = this.formatTitle(suffix, true);
         newTitle = `${newTitle} ${formattedSuffix}`;
     }

     return {
         ...item,
         title: newTitle
     };
  }
}
