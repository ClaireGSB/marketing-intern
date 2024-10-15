// src/promptGenerators/SnippetsProcessors/platformProcessor.ts

import type { ContentTypeName } from '~/types/contentTypes';

const platformSnippet = (contentType: ContentTypeName): string =>
  contentType === 'linkedin_post' ? 'LinkedIn' : 'Twitter';

const contentTypeSnippet = (contentType: ContentTypeName): string =>
  contentType === 'linkedin_post' ? 'Linkedin Post' : 'Twitter Post';