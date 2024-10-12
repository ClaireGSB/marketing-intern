// src/services/MockApiClient.ts

export interface Example {
  id: number;
  created_by: number;
  updated_by: number;
  content_type_id: number;
  content_subtype_id: number | null;
  content_output_id: number | null;
  example_type: string;
  name: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  explanation: string | null;
}

export interface Users {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_admin: boolean;
}

export interface Organizations {
  id: number;
  name: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ContentType {
  id: number;
  name: string;
  created_at: string;
}

export interface ContentSubType {
  id: number;
  user_id: number;
  content_type_id: number;
  name: string;
  target_audience: string | null;
  context: string | null;
  guidelines: string | null;
  created_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_at: string;
}

export interface GeneralInfoData {
  companyDescription: string;
  contentStrategy: string;
}

export interface ContentOutput {
  id: number;
  created_by: number;
  content_type_id: number;
  content_subtype_id: number | null;
  original_content_id: number | null;
  version_number: number;
  content: string;
  created_at: string;
  status: 'generating' | 'pending validation' | 'completed' | 'scheduled' | 'published' | 'failed';
  is_current_version: boolean;
}

export interface AppData {
  users: Users[];
  content_types: ContentType[];
  content_sub_types: ContentSubType[];
  examples: Example[];
  content_outputs: ContentOutput[];
}

export type ExampleData = {
  content: string | null;
  name: string;
  example_type: string;
  explanation: string | null;
};

export type LocalExample = ExampleData & { id: number };

export interface UserInput {
  subTypeID: number;
  action: string;
  topic?: string;
  target_audience?: string;
  guidelines?: string;
  context?: string;
}

export interface SettingsInput {
  target_audience?: string;
  guidelines?: string;
  context?: string;
  examples: ExampleData[];
}

// Dummy data

const dummyData: AppData = {
  users: [
    {
      id: 1,
      org_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'jd@doe.com',
      password: 'password',
      created_at: '2024-09-20T10:00:00Z',
      updated_at: '2024-09-20T10:00:00Z',
      deleted_at: null,
      is_admin: false,
    },
  ],
  "content_types": [
    {
      "id": 1,
      "name": "Blog Post",
      "created_at": "2024-09-20T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Twitter Post",
      "created_at": "2024-09-20T10:00:00Z"
    },
  ],
  "content_sub_types": [
    {
      "id": 1,
      "user_id": 1,
      "content_type_id": 3,
      "name": "default",
      "target_audience": null,
      "context": null,
      "guidelines": null,
      "created_at": "2024-09-20T10:00:00Z",
      "deleted_at": null,
      "created_by": 1,
      "updated_at": "2024-09-20T10:00:00Z"
    },
    {
      "id": 2,
      "content_type_id": 2,
      "name": "default",
      "target_audience": null,
      "context": null,
      "guidelines": null,
      "user_id": 1,
      "created_at": "2024-09-20T10:00:00Z",
      "deleted_at": null,
      "created_by": 1,
      "updated_at": "2024-09-20T10:00:00Z"
    },
    {
      "id": 2,
      "content_type_id": 8,
      "name": "default",
      "target_audience": null,
      "context": null,
      "guidelines": null,
      "user_id": 1,
      "created_at": "2024-09-20T10:00:00Z",
      "deleted_at": null,
      "created_by": 1,
      "updated_at": "2024-09-20T10:00:00Z"
    },
    {
      "id": 2,
      "content_type_id": 9,
      "name": "default",
      "target_audience": null,
      "context": null,
      "guidelines": null,
      "user_id": 1,
      "created_at": "2024-09-20T10:00:00Z",
      "deleted_at": null,
      "created_by": 1,
      "updated_at": "2024-09-20T10:00:00Z"
    },
  ],
  "examples": [],
  "content_outputs": [
    {
      "id": 1,
      "content_type_id": 2,
      "content_subtype_id": 4,
      "original_content_id": null,
      "version_number": 1,
      "content": "If I were a grammar rule, I'd be the subjunctive mood - always hypothetical, never quite real. Use me for wishes, suggestions, and 'what ifs'. English learners, can you spot me in this tweet? #EnglishGrammar #LanguageTwists",
      "created_at": "2024-09-21T22:03:52.994Z",
      "created_by": 1,
      "status": "completed",
      "is_current_version": true
    },
    {
      "id": 2,
      "content_type_id": 2,
      "content_subtype_id": 4,
      "original_content_id": 2,
      "version_number": 1,
      "content": "Wish you were here... using the subjunctive mood correctly! It's the grammar that turns reality on its head. \"If I were you,\" I'd practice it. See what I did there? #EnglishLearners #GrammarMagic",
      "created_at": "2024-09-21T22:05:35.657Z",
      "created_by": 1,
      "status": "completed",
      "is_current_version": true
    },
  ],
};

class MockApiClient {

  async getUserBytId(userId: number): Promise<Users> {
    console.log(`Fetching user with id ${userId}`);
    // get user ID from dummyData
    return new Promise((resolve, reject) => {
      const user = dummyData.users.find(u => u.id === userId);
      if (user) {
        resolve(user);
      } else {
        reject(new Error(`User with id ${userId} not found`));
      }
    });
  }

  async getContentTypes(): Promise<ContentType[]> {
    console.log('Fetching all content types');
    return new Promise(resolve => {
      resolve(dummyData.content_types);
    });
  }

  async getContentSubtypesByUserID(userID: number): Promise<ContentSubType[]> {
    console.log(`Fetching content subtypes with user id ${userID}`);
    // return all content subtypes from dummyData with user_id === userID
    return new Promise(resolve => {
      const contentSubTypes = dummyData.content_sub_types.filter(cst => cst.user_id === userID);
      console.log(contentSubTypes);
      resolve(contentSubTypes);
    }
    );
  }

  async getExamplesByUserID(userID: number): Promise<Example[]> {
    console.log(`Fetching example with user id ${userID}`);
    return new Promise(resolve => {
      const examples = dummyData.examples.filter(e => e.created_by === userID);
      console.log(examples);
      resolve(examples);
    });
  }

  async getContentOutputsByUserID(userID: number): Promise<ContentOutput[]> {
    console.log(`Fetching content output with user id ${userID}`);
    return new Promise((resolve, reject) => {
      const contentOutputs = dummyData.content_outputs.filter(co => co.created_by === userID);
      console.log(contentOutputs);
      if (contentOutputs) {
        resolve(contentOutputs);
      } else {
        reject(new Error(`Content output with id ${userID} not found`));
      }
    });
  }

  async addExample(data: ExampleData, userID: number, contentTypeID: number, contentSubtypeID: number | null): Promise<Example> {
    console.log('Adding example', data);
    return new Promise(resolve => {
      setTimeout(() => {
        const newExample: Example = {
          id: dummyData.examples.length > 0 ? Math.max(...dummyData.examples.map(e => e.id)) + 1 : 1,
          created_by: userID,
          updated_by: userID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          content_type_id: contentTypeID,
          content_subtype_id: contentSubtypeID,
          deleted_at: null,
          content_output_id: null,
          ...data,
        };
        dummyData.examples.push(newExample);
        resolve(newExample);
      }, 500);
    });
  }

  async updateExample(exampleId: number, data: Partial<Example>): Promise<Example> {
    console.log(`Updating example with id ${exampleId}`, data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = dummyData.examples.findIndex(e => e.id === exampleId);
        if (index !== -1) {
          dummyData.examples[index] = { ...dummyData.examples[index], ...data };
          console.log(dummyData.examples[index]);
          resolve(dummyData.examples[index]);
        } else {
          reject(new Error(`Example with id ${exampleId} not found`));
        }
      }, 500);
    });
  }

  async deleteExample(exampleId: number): Promise<void> {
    console.log(`Deleting example with id ${exampleId}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = dummyData.examples.findIndex(e => e.id === exampleId);
        if (index !== -1) {
          dummyData.examples.splice(index, 1);
          resolve();
        } else {
          reject(new Error(`Example with id ${exampleId} not found`));
        }
      }, 500);
    });
  }

  async createContentSubType(contentTypeId: number, userID: number, name: string): Promise<ContentSubType> {
    console.log(`Creating new content subtype for content type ${contentTypeId}`, name);
    return new Promise(resolve => {
      const newSubtype: ContentSubType = {
        id: Math.max(...dummyData.content_sub_types.map(cst => cst.id)) + 1,
        user_id: userID,
        content_type_id: contentTypeId,
        target_audience: null,
        context: null,
        guidelines: null,
        created_at: new Date().toISOString(),
        deleted_at: null,
        created_by: 1,
        updated_at: new Date().toISOString(),
        name: name,
      };
      resolve(newSubtype);
    });
  }

  async updateContentSubType(contentSubTypeId: number, field: "target_audience" | "context" | "guidelines", content: string): Promise<ContentSubType> {
    console.log(`Updating content subtype with id ${contentSubTypeId}`, field, content);
    return new Promise((resolve, reject) => {
      const index = dummyData.content_sub_types.findIndex(cst => cst.id === contentSubTypeId);
      if (index !== -1) {
        dummyData.content_sub_types[index][field] = content;
        const newSubtype = dummyData.content_sub_types[index];
        resolve(newSubtype);
      } else {
        reject(new Error(`Content subtype with id ${contentSubTypeId} not found`));
      }
    });
  }

  async requestContentGenerationFromAPI(contentSubTypeId: number, userInput: UserInput, settingInput: SettingsInput): Promise<ContentOutput> {
    console.log(`Requesting content generation for content subtype with id ${contentSubTypeId}`)
    console.log('User input:', userInput);
    console.log('Settings input:', settingInput);
    return new Promise(resolve => {
      const newContentOutput: ContentOutput = {
        id: Math.max(...dummyData.content_outputs.map(co => co.id)) + 1,
        created_by: 1,
        content_type_id: 1,
        content_subtype_id: contentSubTypeId,
        original_content_id: null,
        version_number: 1,
        content: '',
        created_at: new Date().toISOString(),
        status: 'generating',
        is_current_version: true,
      };
      dummyData.content_outputs.push(newContentOutput);
      // TODO: implement logic to ask the content generation from the API
      resolve(newContentOutput);
    });
  }
}

export const mockApiClient = new MockApiClient();
