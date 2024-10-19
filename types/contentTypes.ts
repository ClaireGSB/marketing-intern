// types/contentTypes.ts

import { get } from "http";

// need to add recipe ID to the below
// also add allowed actions and their required fields
export interface ContentType {
  id: number;
  name: string;
  display_name: string;
  _status: string;
  available_actions: string[];
  created_at: string;
  required_fields: string[];
  optional_fields: string[];
}

export type ContentTypeName = 'blog_post' | 'twitter_post' | 'linkedin_post' | 'guidelines' | 'nativish_input_text' | 'nativish_screenshot' | 'twitter_post_ideas' | 'blog_outline'

export const contentTypes: ContentType[] = [
  // {
  //   "id": 1,
  //   "name": "blog_post",
  //   "display_name": "Blog Post",
  //   "created_at": "2024-09-20T10:00:00Z",
  //   "_status": "TO DELETE, replaced by blog_post_copy",
  // },
  {
    "id": 2,
    "name": "twitter_post",
    "display_name": "Twitter Post",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "mostly good",
    "available_actions": ['write_topic', 'repurpose_content', 'promote_content', 'promote_product'],
    "required_fields": [],
    "optional_fields": []
  },
  {
    "id": 3,
    "name": "linkedin_post",
    "display_name": "LinkedIn Post",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "mostly good",
    "available_actions": ['write_topic', 'repurpose_content', 'promote_content', 'promote_product'],
    "required_fields": [],
    "optional_fields": []
  },
  // {
  //   "id": 4,
  //   "name": "guidelines",
  //   "display_name": "Guidelines",
  //   "created_at": "2024-09-20T10:00:00Z",
  //   "_status": "old"
  // },
  {
    "id": 5,
    "name": "nativish_input_text",
    "display_name": "Nativish Input Text",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "to review",
    "available_actions": ['write_topic'],
    "required_fields": [],
    "optional_fields": []
  },
  {
    "id": 6,
    "name": "nativish_screenshot",
    "display_name": "Nativish Screenshot",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "to review",
    "available_actions": ['write_topic'],
    "required_fields": [],
    "optional_fields": []
  },
  // {
  //   "id": 7,
  //   "name": "twitter_post_ideas",
  //   "display_name": "Twitter Post Ideas",
  //   "created_at": "2024-09-20T10:00:00Z",
  //   "_status": "to review"
  // },
  {
    "id": 8,
    "name": "blog_outline",
    "display_name": "Blog Post Outline",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "mostly good, need to fine tune and change the models to Sonnet",
    "available_actions": ['write_topic', 'repurpose_content', 'promote_content', 'promote_product'],
    "required_fields": [],
    "optional_fields": ['seo_phrase']
  },
  {
    "id": 9,
    "name": "blog_post",
    "display_name": "Blog Post Copy",
    "created_at": "2024-09-20T10:00:00Z",
    "_status": "to review",
    "available_actions": ['write_topic', 'repurpose_content', 'promote_content', 'promote_product'],
    "required_fields": ['outline'],
    "optional_fields": ['seo_phrase']
  }

]

const contentTypesFrontEndIDs = [2, 3, 8, 9]

// export contentTypesFrontEnd which is the contentTypes filtered by the contentTypesFrontEndIDs
export const contentTypesFrontEnd = contentTypes.filter(contentType => contentTypesFrontEndIDs.includes(contentType.id))


export const getContentTypeByName = (name: string): ContentType | undefined => {
  return contentTypes.find(contentType => contentType.name === name)
}

export const getContentTypeNameByID = (id: number): string | undefined => {
  // only return the ContentType.name
  const name = contentTypes.find(contentType => contentType.id === id)?.name
  return name
}
