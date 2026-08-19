// // src/helpers/hateoas.ts

// export interface Link {
//   rel: string;
//   href: string;
//   method: string;
// }

// export interface Resource<T> {
//   data: T;
//   links: Link[];
// }

// /**
//  * Builder simples para montar respostas HATEOAS.
//  */
// export class ResourceBuilder<T> {
//   private links: Link[] = [];

//   constructor(private readonly data: T) {}

//   addLink(rel: string, method: string, href: string): this {
//     this.links.push({ rel, method, href });
//     return this;
//   }

//   build(): Resource<T> {
//     return {
//       data: this.data,
//       links: this.links,
//     };
//   }
// }

// export const resourceOf = <T>(data: T) => new ResourceBuilder<T>(data);
