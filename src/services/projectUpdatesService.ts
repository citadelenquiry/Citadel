import { Project, ProjectLiveUpdate } from '../types';
import { allProjectsData, projectsData } from '../data/projectsData';

const STORAGE_KEY = 'citadel_project_live_updates';
const EVENT_KEY = 'citadel_live_updates_changed';

// Structure in localStorage: { [projectId: string]: ProjectLiveUpdate[] }
type LiveUpdatesMap = Record<string, ProjectLiveUpdate[]>;

function getStoredOverrides(): LiveUpdatesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading live updates from localStorage:', err);
  }
  return {};
}

function saveOverrides(overrides: LiveUpdatesMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent(EVENT_KEY));
  } catch (err) {
    console.error('Error saving live updates to localStorage:', err);
  }
}

export const projectUpdatesService = {
  /**
   * Get all live updates for a specific project (merging defaults with localStorage overrides)
   */
  getLiveUpdates(projectId: string): ProjectLiveUpdate[] {
    const overrides = getStoredOverrides();
    if (overrides[projectId] !== undefined) {
      return overrides[projectId];
    }
    const found = allProjectsData.find((p) => p.id === projectId);
    return found ? [...found.liveUpdates] : [];
  },

  /**
   * Get a project object with its latest live updates applied
   */
  getProjectWithUpdates(project: Project): Project {
    const updates = this.getLiveUpdates(project.id);
    return {
      ...project,
      liveUpdates: updates,
    };
  },

  /**
   * Get all active projects with current live updates
   */
  getAllProjects(): Project[] {
    return projectsData.map((p) => this.getProjectWithUpdates(p));
  },

  /**
   * Add a new live update milestone card to a project
   */
  addUpdate(projectId: string, newUpdate: Omit<ProjectLiveUpdate, 'id'>): ProjectLiveUpdate {
    const currentList = this.getLiveUpdates(projectId);
    const created: ProjectLiveUpdate = {
      ...newUpdate,
      id: `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updatedList = [created, ...currentList];
    const overrides = getStoredOverrides();
    overrides[projectId] = updatedList;
    saveOverrides(overrides);
    return created;
  },

  /**
   * Update an existing milestone card
   */
  editUpdate(projectId: string, updatedCard: ProjectLiveUpdate): void {
    const currentList = this.getLiveUpdates(projectId);
    const index = currentList.findIndex((item) => item.id === updatedCard.id);
    if (index !== -1) {
      currentList[index] = updatedCard;
      const overrides = getStoredOverrides();
      overrides[projectId] = [...currentList];
      saveOverrides(overrides);
    }
  },

  /**
   * Delete a milestone card
   */
  deleteUpdate(projectId: string, updateId: string): void {
    const currentList = this.getLiveUpdates(projectId);
    const filtered = currentList.filter((item) => item.id !== updateId);
    const overrides = getStoredOverrides();
    overrides[projectId] = filtered;
    saveOverrides(overrides);
  },

  /**
   * Reorder milestone cards
   */
  reorderUpdates(projectId: string, reorderedList: ProjectLiveUpdate[]): void {
    const overrides = getStoredOverrides();
    overrides[projectId] = reorderedList;
    saveOverrides(overrides);
  },

  /**
   * Reset a project's live updates back to initial code default
   */
  resetToDefault(projectId: string): void {
    const overrides = getStoredOverrides();
    delete overrides[projectId];
    saveOverrides(overrides);
  },

  /**
   * Generates formatted TypeScript code for a specific project's liveUpdates array
   * to easily paste into src/data/projectsData.ts
   */
  generateCodeSnippet(projectId: string): string {
    const updates = this.getLiveUpdates(projectId);
    return `// Updated liveUpdates for ${projectId}\nliveUpdates: ${JSON.stringify(updates, null, 2)},`;
  },

  /**
   * Generates formatted JSON of all live updates across all projects
   */
  generateAllUpdatesJson(): string {
    const all: Record<string, ProjectLiveUpdate[]> = {};
    projectsData.forEach((p) => {
      all[p.id] = this.getLiveUpdates(p.id);
    });
    return JSON.stringify(all, null, 2);
  },

  /**
   * Subscribe to changes
   */
  subscribe(callback: () => void): () => void {
    window.addEventListener(EVENT_KEY, callback);
    return () => window.removeEventListener(EVENT_KEY, callback);
  },
};
