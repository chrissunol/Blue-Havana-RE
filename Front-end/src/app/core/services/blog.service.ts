import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  BlogArticle,
  BlogArticleStatus,
  CreateBlogArticle,
  UpdateBlogArticle
} from '../models/blog-article.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly articlesSubject =
    new BehaviorSubject<BlogArticle[]>(
      this.createInitialArticles()
    );

  readonly articles$ =
    this.articlesSubject.asObservable();

  getArticles(): BlogArticle[] {
    return [...this.articlesSubject.value];
  }

  getArticlesObservable(): Observable<BlogArticle[]> {
    return this.articles$;
  }

  getPublishedArticles(): BlogArticle[] {
    return this.articlesSubject.value.filter(
      article => article.status === 'published'
    );
  }

  getPublishedArticlesObservable():
    Observable<BlogArticle[]> {
    return this.articles$.pipe(
      map(articles =>
        articles.filter(
          article => article.status === 'published'
        )
      )
    );
  }

  getArticleById(id: string): BlogArticle | null {
    return (
      this.articlesSubject.value.find(
        article => article.id === id
      ) ?? null
    );
  }

  getArticleBySlug(slug: string): BlogArticle | null {
    return (
      this.articlesSubject.value.find(
        article =>
          article.slug === slug &&
          article.status === 'published'
      ) ?? null
    );
  }

  getRelatedArticles(
    selectedArticle: BlogArticle,
    limit = 3
  ): BlogArticle[] {
    const publishedArticles =
      this.getPublishedArticles().filter(
        article => article.id !== selectedArticle.id
      );

    const sameCategory = publishedArticles.filter(
      article =>
        article.category === selectedArticle.category
    );

    const otherCategories = publishedArticles.filter(
      article =>
        article.category !== selectedArticle.category
    );

    return [
      ...sameCategory,
      ...otherCategories
    ].slice(0, limit);
  }

  createArticle(
    data: CreateBlogArticle
  ): BlogArticle {
    const now = new Date().toISOString();

    const article: BlogArticle = {
      id: this.generateId(),
      slug: this.generateUniqueSlug(
        data.title.es
      ),

      title: {
        ...data.title
      },

      excerpt: {
        ...data.excerpt
      },

      content: {
        ...data.content
      },

      category: data.category,
      author: data.author.trim(),
      coverImage:
        data.coverImage.trim() ||
        'assets/images/placeholder.svg',

      status: data.status,
      featured: data.featured,
      readingTime: data.readingTime,

      publishedAt:
        data.status === 'published'
          ? now
          : undefined,

      createdAt: now
    };

    let currentArticles =
      this.articlesSubject.value;

    if (article.featured) {
      currentArticles = currentArticles.map(
        currentArticle => ({
          ...currentArticle,
          featured: false
        })
      );
    }

    this.articlesSubject.next([
      article,
      ...currentArticles
    ]);

    return article;
  }

  updateArticle(
    id: string,
    changes: UpdateBlogArticle
  ): BlogArticle | null {
    const currentArticle =
      this.getArticleById(id);

    if (!currentArticle) {
      return null;
    }

    const previousStatus = currentArticle.status;

    const updatedArticle: BlogArticle = {
      ...currentArticle,
      ...changes,

      title: changes.title
        ? { ...changes.title }
        : currentArticle.title,

      excerpt: changes.excerpt
        ? { ...changes.excerpt }
        : currentArticle.excerpt,

      content: changes.content
        ? { ...changes.content }
        : currentArticle.content,

      slug:
        changes.slug?.trim() ||
        (
          changes.title?.es
            ? this.generateUniqueSlug(
                changes.title.es,
                id
              )
            : currentArticle.slug
        ),

      updatedAt: new Date().toISOString(),

      publishedAt:
        changes.status === 'published' &&
        previousStatus !== 'published'
          ? new Date().toISOString()
          : currentArticle.publishedAt
    };

    let articles =
      this.articlesSubject.value.map(article =>
        article.id === id
          ? updatedArticle
          : article
      );

    if (updatedArticle.featured) {
      articles = articles.map(article =>
        article.id === id
          ? article
          : {
              ...article,
              featured: false
            }
      );
    }

    this.articlesSubject.next(articles);

    return updatedArticle;
  }

  deleteArticle(id: string): void {
    const articles =
      this.articlesSubject.value.filter(
        article => article.id !== id
      );

    this.articlesSubject.next(articles);
  }

  changeArticleStatus(
    id: string,
    status: BlogArticleStatus
  ): void {
    const article = this.getArticleById(id);

    if (!article) {
      return;
    }

    this.updateArticle(id, {
      status
    });
  }

  toggleFeatured(id: string): void {
    const article = this.getArticleById(id);

    if (!article) {
      return;
    }

    this.updateArticle(id, {
      featured: !article.featured
    });
  }

  private generateUniqueSlug(
    title: string,
    ignoredArticleId?: string
  ): string {
    const baseSlug = this.slugify(title);

    let slug = baseSlug;
    let suffix = 2;

    const slugExists = (
      candidateSlug: string
    ): boolean =>
      this.articlesSubject.value.some(
        article =>
          article.slug === candidateSlug &&
          article.id !== ignoredArticleId
      );

    while (slugExists(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return slug;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateId(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    return `article-${Date.now()}`;
  }

  private createInitialArticles():
    BlogArticle[] {
    return [
      {
        id: 'article-1',
        slug: 'como-renovar-una-casa-antigua',

        title: {
          es: 'Cómo renovar una casa antigua sin perder su esencia',
          en: 'How to renovate an old house without losing its character',
          fr: 'Comment rénover une maison ancienne sans perdre son caractère'
        },

        excerpt: {
          es: 'Descubre cómo conservar los elementos históricos de una vivienda mientras mejoras su funcionalidad, seguridad y comodidad.',
          en: 'Discover how to preserve a home’s historic elements while improving its functionality, safety and comfort.',
          fr: 'Découvrez comment préserver les éléments historiques d’une maison tout en améliorant sa fonctionnalité, sa sécurité et son confort.'
        },

        content: {
          es: `Renovar una casa antigua requiere encontrar un equilibrio entre conservación y modernización.

Antes de iniciar cualquier trabajo es importante evaluar la estructura, las instalaciones eléctricas, la plomería, la cubierta y el estado general de los materiales.

Los elementos originales que se encuentren en buenas condiciones pueden restaurarse. Puertas de madera, pisos tradicionales, molduras y ventanas pueden aportar un valor especial a la propiedad.

Las nuevas instalaciones deben integrarse sin afectar el carácter arquitectónico del inmueble. Una planificación adecuada permite mejorar la seguridad y el confort manteniendo la esencia original.`,

          en: `Renovating an old house requires finding a balance between preservation and modernization.

Before starting any work, it is important to evaluate the structure, electrical systems, plumbing, roof and overall condition of the materials.

Original elements that remain in good condition can be restored. Wooden doors, traditional floors, moldings and windows can add special value to the property.

New installations should be integrated without affecting the architectural character of the building. Proper planning improves safety and comfort while preserving its original essence.`,

          fr: `La rénovation d’une maison ancienne nécessite un équilibre entre conservation et modernisation.

Avant de commencer les travaux, il est important d’évaluer la structure, les installations électriques, la plomberie, la toiture et l’état général des matériaux.

Les éléments d’origine en bon état peuvent être restaurés. Les portes en bois, les sols traditionnels, les moulures et les fenêtres peuvent apporter une valeur particulière à la propriété.

Les nouvelles installations doivent être intégrées sans altérer le caractère architectural du bâtiment. Une bonne planification améliore la sécurité et le confort tout en préservant son essence originale.`
        },

        category: 'renovation',
        author: 'Blue Havana Real Estate',

        coverImage:
          'assets/images/blog/renovacion-casa-antigua.jpg',

        status: 'published',
        featured: true,
        readingTime: 6,

        publishedAt: '2026-06-24T10:00:00',
        createdAt: '2026-06-24T10:00:00'
      },

      {
        id: 'article-2',
        slug:
          'estilos-arquitectonicos-que-aumentan-el-valor',

        title: {
          es: 'Estilos arquitectónicos que pueden aumentar el valor de una propiedad',
          en: 'Architectural styles that can increase a property’s value',
          fr: 'Les styles architecturaux pouvant augmenter la valeur d’une propriété'
        },

        excerpt: {
          es: 'Conoce qué características arquitectónicas pueden hacer una propiedad más atractiva para compradores e inversionistas.',
          en: 'Learn which architectural features can make a property more attractive to buyers and investors.',
          fr: 'Découvrez les caractéristiques architecturales pouvant rendre une propriété plus attractive pour les acheteurs et investisseurs.'
        },

        content: {
          es: `El estilo arquitectónico influye en la percepción, funcionalidad y valor de una propiedad.

Las viviendas coloniales destacan por sus patios, techos altos y elementos originales. Las propiedades modernas suelen resultar atractivas por sus espacios abiertos y grandes ventanales.

El estilo tropical mejora la relación entre los espacios interiores y exteriores, mientras que el diseño contemporáneo incorpora eficiencia, tecnología y materiales actuales.

La mejor elección dependerá de la ubicación, el público objetivo y el estado original del inmueble.`,

          en: `Architectural style influences the perception, functionality and value of a property.

Colonial homes stand out for their courtyards, high ceilings and original elements. Modern properties are often attractive because of their open spaces and large windows.

Tropical style improves the connection between interior and exterior spaces, while contemporary design incorporates efficiency, technology and modern materials.

The best choice depends on the location, target audience and original condition of the property.`,

          fr: `Le style architectural influence la perception, la fonctionnalité et la valeur d’une propriété.

Les maisons coloniales se distinguent par leurs patios, leurs hauts plafonds et leurs éléments d’origine. Les propriétés modernes sont souvent appréciées pour leurs espaces ouverts et leurs grandes fenêtres.

Le style tropical améliore la relation entre les espaces intérieurs et extérieurs, tandis que le design contemporain intègre efficacité, technologie et matériaux modernes.

Le meilleur choix dépend de l’emplacement, du public cible et de l’état initial de la propriété.`
        },

        category: 'architecture',
        author: 'Blue Havana Real Estate',

        coverImage:
          'assets/images/blog/estilos-arquitectonicos.jpg',

        status: 'published',
        featured: false,
        readingTime: 5,

        publishedAt: '2026-06-18T10:00:00',
        createdAt: '2026-06-18T10:00:00'
      }
    ];
  }
}