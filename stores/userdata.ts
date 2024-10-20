// Utilities
import { defineStore } from 'pinia';
import { api } from '../services/apiClient';
import * as FrontendTypes from '../types/frontendTypes';
import { type ContentType, contentTypesFrontEnd } from '../types/contentTypes';
import { actions, type ActionConfig } from '../types/actionTypes';

type State = {
  userID: string;
  users: FrontendTypes.Users[];
  contentTypes: ContentType[];
  actions: Record<string, ActionConfig>;
  contentSubTypes: FrontendTypes.ContentSubType[]; // Replace any with specific type if known
  examples: FrontendTypes.Example[];
  contentOutputs: FrontendTypes.ContentOutput[];
  validationsItems: FrontendTypes.Validations[];
  blogMetadata: FrontendTypes.BlogMetadata[];
  projectSetups: FrontendTypes.UserInput[];
  subtypeSettingsHistory: FrontendTypes.SettingsInput[];
};

export const useUserDataStore = defineStore('userData', {
  state: (): State => ({
    users: [],
    contentTypes: contentTypesFrontEnd,
    actions: actions,
    contentSubTypes: [],
    examples: [],
    contentOutputs: [],
    blogMetadata: [],
    validationsItems: [],
    userID: '',
    projectSetups: [],
    subtypeSettingsHistory: [],
  }),
  actions: {
    async fetchUserData() {
      this.userID = await api.fetchUserID();
      this.users = await api.fetchUsers();
      this.contentSubTypes = await api.fetchContentSubtypes();
      this.examples = await api.fetchExamples();
      this.contentOutputs = await api.fetchContentOutputs();
      this.validationsItems = await api.fetchValidations();
      this.blogMetadata = await api.fetchBlogMetadatas();
    },
    getContentOutputById(contentOutputID: string) {
      return this.contentOutputs.find((contentOutput) => contentOutput.id === contentOutputID);
    },
    async getBlogMetadataByContentOutputId(contentOutputID: string) {
      // check that content output status is completed
      const contentOutput = this.getContentOutputById(contentOutputID);
      if (!contentOutput || contentOutput.status !== 'completed') {
        return null;
      }
      // if it is, check if metadata is in the store
      if (!this.blogMetadata.find((metadata) => metadata.content_output_id === contentOutputID)) {
        // if not, fetch it from the API
        console.log('Blog metadata not in store, fetching from API for ID:', contentOutputID);
        const blogMetadata = await api.getBlogMetadataByContentOutputId(contentOutputID);
        this.blogMetadata.push(blogMetadata);
        return blogMetadata;
      } else {
        // if it is, return it
        console.log('Blog metadata already in store');
        return this.blogMetadata.find((metadata) => metadata.content_output_id === contentOutputID);
      }
    },
    async fetchProjectSetupByContentOutput(contentOutputID: string) {
      // If the project setup is not in the store, fetch it from the API
      if (!this.getProjectSetupByContentOutputId(contentOutputID)) {
        console.log('Project setup not in store, fetching from API for ID:', contentOutputID);
        const projectSetup = await api.fetchProjectSetup(contentOutputID);
        console.log('Project setup fetched from API:', projectSetup);
        this.projectSetups.push(projectSetup);
        return projectSetup;
      } else {
        console.log('Project setup already in store');
        console.log('Project setup:', this.getProjectSetupByContentOutputId(contentOutputID));
        return this.getProjectSetupByContentOutputId(contentOutputID);
      }
    },
    async fetchSubtypeSettingsHistoryByContentOutput(contentSubtypeID: string) {
      // If the subtype settings history is not in the store, fetch it from the API
      if (!this.getSubtypeSettingsHistoryByContentOutputId(contentSubtypeID)) {
        console.log('Subtype settings history not in store, fetching from API for ID:', contentSubtypeID);
        const subtypeSettingsHistory = await api.fetchSubtypeSettingsHistory(contentSubtypeID);
        console.log('Subtype settings history fetched from API:', subtypeSettingsHistory);
        this.subtypeSettingsHistory.push(subtypeSettingsHistory);
        return subtypeSettingsHistory;
      } else {
        console.log('Subtype settings history already in store');
        console.log('Subtype settings history:', this.getSubtypeSettingsHistoryByContentOutputId(contentSubtypeID));
        return this.getSubtypeSettingsHistoryByContentOutputId(contentSubtypeID);
      }
    },
    async addExample(example: FrontendTypes.Example) {
      const newExample = await api.createExample(example);
      this.examples.push(newExample);
    },
    async updateExample(exampleID: string, data: Partial<FrontendTypes.Example>) {
      // remove id from data (we have it separately anyway)
      const { id, ...dataWithoutId } = data;
      const updatedExample = await api.updateExample(exampleID, dataWithoutId);
      const index = this.examples.findIndex((example) => example.id === updatedExample.id);
      this.examples[index] = updatedExample;
    },
    async deleteExample(exampleID: string) {
      await api.deleteExample(exampleID);
      this.examples = this.examples.filter((example) => example.id !== exampleID);
    },
    async updateContentSubType(contentSubTypeID: string, field: "target_audience" | "context" | "guidelines", content: string) {
      const update = { [field]: content };
      const updatedContentSubType = await api.updateContentSubtype(contentSubTypeID, update);
      // update the local store
      const index = this.contentSubTypes.findIndex((contentSubType) => contentSubType.id === updatedContentSubType.id);
      console.log(updatedContentSubType);
      this.contentSubTypes[index] = updatedContentSubType;
    },
    async createContentSubType(contentTypeId: number, name: string) {
      const newContentSubType = await api.createContentSubtype(name, contentTypeId);
      this.contentSubTypes.push(newContentSubType);
      console.log(newContentSubType);
      return newContentSubType;
    },
    async deleteContentSubType(contentSubTypeID: string) {
      await api.deleteContentSubtype(contentSubTypeID);
      this.contentSubTypes = this.contentSubTypes.filter((contentSubType) => contentSubType.id !== contentSubTypeID);
    },
    getExamplesByContentSubTypeID(contentSubTypeID: string): FrontendTypes.Example[] {
      return this.examples
        .filter((example) => example.content_subtype_id === contentSubTypeID)
        .map((example) => ({
          id: example.id,
          content_subtype_id: example.content_subtype_id,
          name: example.name,
          example_type: example.example_type,
          explanation: example.explanation,
          content: example.content,
        }));
    },
    getTargetAudienceByContentSubTypeID(contentSubtypeID: string) {
      return this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubtypeID)?.target_audience ?? '';
    },
    getContentTypeNameById(contentTypeID: number) {
      return this.contentTypes.find((contentType) => contentType.id === contentTypeID)?.name ?? '';
    },
    getContentTypeDisplayNameById(contentTypeID: number) {
      return this.contentTypes.find((contentType) => contentType.id === contentTypeID)?.display_name ?? '';
    },
    getContentSubTypeNameById(contentSubTypeID: string) {
      return this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.name ?? '';
    },
    getSubtypesForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID);
    },
    getSubtypesIDsForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID).map((contentSubType) => contentSubType.id);
    },
    getSubtypesIDsAndNamesForContentType(contentTypeID: number) {
      return this.contentSubTypes.filter((contentSubType) => contentSubType.content_type_id === contentTypeID).map((contentSubType) => ({ id: contentSubType.id, name: contentSubType.name }));
    },
    getFieldsForContentSubType(contentSubTypeID: string) {
      const context = this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.context ?? '';
      const guidelines = this.contentSubTypes.find((contentSubType) => contentSubType.id === contentSubTypeID)?.guidelines ?? '';
      const examples = this.getExamplesByContentSubTypeID(contentSubTypeID);
      const target_audience = this.getTargetAudienceByContentSubTypeID(contentSubTypeID);
      return {
        context: context,
        guidelines: guidelines,
        examples: examples,
        target_audience: target_audience,
      };
    },
    getSelectedContentOutput(contentOutputId: string | undefined): FrontendTypes.ContentOutput | null {
      if (!contentOutputId) return null;
      return this.contentOutputs.find(output => output.id === contentOutputId) || null;
    },
    fetchValidations(contentOutputID: string) {
      const validations = this.validationsItems.filter((validationItem) => validationItem.content_output_id === contentOutputID);
      console.log('userStore fetching validations:', validations);
      return validations;
    },
    async updateValidationItem(validationItem: FrontendTypes.Validations) {
      // TO DO: uncomment this when the API is ready
      validationItem.validation_status = 'completed';
      const updatedValidationItem = await api.updateValidation(validationItem.id, validationItem);
      console.log('userStore updating validationItem:', updatedValidationItem);

      const index = this.validationsItems.findIndex((item) => item.id === validationItem.id);
      this.validationsItems[index] = updatedValidationItem;
    },
    async confirmValidations(contentOutputID: string) {
      const updatedContentOutput = await api.confirmValidations(contentOutputID);
      const index = this.contentOutputs.findIndex((contentOutput) => contentOutput.id === contentOutputID);
      this.contentOutputs[index] = updatedContentOutput;

      // ------ if contentType is blog_post_copy, then update the blogMetadata
      // if (updatedContentOutput.content_type_id === 8) {
      //   const blogMetadata = await apiClient.getBlogMetadataByContentOutputID(contentOutputID);
      //   const index = this.blogMetadata.findIndex((metadata) => metadata.content_output_id === contentOutputID);
      //   this.blogMetadata[index] = blogMetadata;
    },
    async requestContentGenerationFromAPI(userInput: FrontendTypes.UserInput): Promise<FrontendTypes.GeneratedContentResponse> {

      //this initializes the contentOutput job and polls the server for the status of the job
      const newContentOutput = await api.generateContentOutput(userInput);
      this.contentOutputs.push(newContentOutput);

      let generatedResponse: FrontendTypes.GeneratedContentResponse;
      if (newContentOutput.status === 'pending validation') {
        console.log('getting validation items');
        const validations = await api.getValidationsByContentOutput(newContentOutput.id);
        validations.forEach((validationItem) => {
          this.validationsItems.push(validationItem);
        });
        generatedResponse = {
          requiresValidation: true,
          contentOutput: newContentOutput,
          validationData: validations,
        };
      } else {
        generatedResponse = {
          requiresValidation: false,
          contentOutput: newContentOutput,
          validationData: [],
        };
      }

      return generatedResponse;
    },
  },
  getters: {
    userFirstNames(): Record<string, string> {
      return Object.fromEntries(
        this.users.map(user => [user.id, user.first_name])
      );
    },
    getProjectSetupByContentOutputId: (state) => (contentOutputId: string) => {
      const contentOutput = state.contentOutputs.find(output => output.id === contentOutputId);
      if (!contentOutput) return null;

      return state.projectSetups.find(setup => setup.id === contentOutput.project_setup_id) || null;
    },
    getSubtypeSettingsHistoryByContentOutputId: (state) => (contentOutputId: string) => {
      const contentOutput = state.contentOutputs.find(output => output.id === contentOutputId);
      if (!contentOutput) return null;

      return state.subtypeSettingsHistory.find(settings => settings.id === contentOutput.subtype_settings_history_id) || null;
    }
  },
});

