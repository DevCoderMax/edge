/**
 * Plugin Oficial: Smart SEO & OpenGraph
 * Demonstra na prática como um plugin usa Filters e Actions no nosso CMS.
 */
export const SmartSeoPlugin = {
  id: 'smart-seo',
  name: 'Smart SEO & Social Meta',
  version: '1.0.0',

  setup(cms) {
    // 1. Adiciona campos personalizados na barra lateral do Editor React
    cms.addFilter(
      'admin:post_sidebar_fields',
      (fields) => [
        ...fields,
        { key: 'seo_title', label: 'Título SEO (Google)', type: 'text' },
        { key: 'seo_description', label: 'Meta Descrição (155 caracteres)', type: 'textarea' }
      ],
      10,
      this.id
    );

    // 2. Antes de salvar o post, preenche automaticamente o SEO se o autor deixou em branco
    cms.addFilter(
      'post:before_save',
      async (post) => {
        const meta = { ...(post.meta || {}) };

        if (!meta.seo_title) {
          meta.seo_title = `${post.title} | Edge CMS`;
        }

        if (!meta.seo_description) {
          const plainText = (post.content_html || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          meta.seo_description =
            plainText.length > 155 ? `${plainText.slice(0, 152)}...` : plainText || post.summary;
        }

        return { ...post, meta };
      },
      10,
      this.id
    );
  }
};
