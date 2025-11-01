import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COIN, Project } from '../types';
import { MOCK_COINS, mockProjects } from '../utils/mockData';
import { SortOption } from '../components/SortSelector';
import { ProjectSortOption } from '../components/ProjectSortSelector';
import { ViewMode } from '../components/ViewToggle';

const SORT_OPTION_KEY = '@design_the_what:sort_option';
const PROJECT_SORT_OPTION_KEY = '@design_the_what:project_sort_option';
const VIEW_MODE_KEY = '@design_the_what:view_mode';
const GROUP_BY_PROJECT_KEY = '@design_the_what:group_by_project';
const COINS_KEY = '@design_the_what:coins';
const PROJECTS_KEY = '@design_the_what:projects';

interface COINContextType {
  coins: COIN[];
  projects: Project[];
  createCOIN: (name: string, projectId: string) => Promise<string>;
  updateCOIN: (coinId: string, updates: Partial<COIN>) => Promise<void>;
  toggleFavorite: (coinId: string) => void;
  duplicateCOIN: (coinId: string) => void;
  createProject: (name: string) => Promise<string>;
  reloadCoins: () => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  projectSortOption: ProjectSortOption;
  setProjectSortOption: (option: ProjectSortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  groupByProject: boolean;
  setGroupByProject: (enabled: boolean) => void;
}

const COINContext = createContext<COINContextType | undefined>(undefined);

export function COINProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState<COIN[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortOption, setSortOptionState] = useState<SortOption>('created-newest');
  const [projectSortOption, setProjectSortOptionState] = useState<ProjectSortOption>('name-asc');
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');
  const [groupByProject, setGroupByProjectState] = useState<boolean>(false);

  useEffect(() => {
    // Load initial data and preferences
    setCoins(MOCK_COINS);
    setProjects(mockProjects);
    loadSortPreference();
    loadProjectSortPreference();
    loadViewModePreference();
    loadGroupByProjectPreference();
  }, []);

  const loadSortPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(SORT_OPTION_KEY);
      if (saved) {
        setSortOptionState(saved as SortOption);
      }
    } catch (error) {
      console.log('Error loading sort preference:', error);
    }
  };

  const loadProjectSortPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(PROJECT_SORT_OPTION_KEY);
      if (saved) {
        setProjectSortOptionState(saved as ProjectSortOption);
      }
    } catch (error) {
      console.log('Error loading project sort preference:', error);
    }
  };

  const setSortOption = async (option: SortOption) => {
    setSortOptionState(option);
    try {
      await AsyncStorage.setItem(SORT_OPTION_KEY, option);
    } catch (error) {
      console.log('Error saving sort preference:', error);
    }
  };

  const setProjectSortOption = async (option: ProjectSortOption) => {
    setProjectSortOptionState(option);
    try {
      await AsyncStorage.setItem(PROJECT_SORT_OPTION_KEY, option);
    } catch (error) {
      console.log('Error saving project sort preference:', error);
    }
  };

  const loadViewModePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(VIEW_MODE_KEY);
      if (saved) {
        setViewModeState(saved as ViewMode);
      }
    } catch (error) {
      console.log('Error loading view mode preference:', error);
    }
  };

  const setViewMode = async (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      await AsyncStorage.setItem(VIEW_MODE_KEY, mode);
    } catch (error) {
      console.log('Error saving view mode preference:', error);
    }
  };

  const loadGroupByProjectPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(GROUP_BY_PROJECT_KEY);
      if (saved) {
        setGroupByProjectState(saved === 'true');
      }
    } catch (error) {
      console.log('Error loading group by project preference:', error);
    }
  };

  const setGroupByProject = async (enabled: boolean) => {
    setGroupByProjectState(enabled);
    try {
      await AsyncStorage.setItem(GROUP_BY_PROJECT_KEY, enabled.toString());
    } catch (error) {
      console.log('Error saving group by project preference:', error);
    }
  };

  const generateUUID = (): string => {
    return `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateProjectUUID = (): string => {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createCOIN = async (name: string, projectId: string): Promise<string> => {
    const now = new Date().toISOString();
    const project = projects.find(p => p.id === projectId);

    const newCOIN: COIN = {
      id: generateUUID(),
      name,
      description: '',
      projectIds: [projectId],
      projectName: project?.name,
      status: 'draft',
      processState: 'current',
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      isFavorite: false,

      // Empty canvas data with single process circle
      circles: [{
        id: 'c1',
        name: '',
        x: 400,
        y: 300,
        radius: 200,
      }],
      participants: [],
      interactions: [],
    };

    // Add to state
    const updatedCoins = [newCOIN, ...coins];
    setCoins(updatedCoins);

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(COINS_KEY, JSON.stringify(updatedCoins));

      // Update project coin count
      if (project) {
        const updatedProject = {
          ...project,
          coinCount: project.coinCount + 1,
          lastModifiedDate: now,
        };
        const updatedProjects = projects.map(p =>
          p.id === projectId ? updatedProject : p
        );
        setProjects(updatedProjects);
        await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
      }
    } catch (error) {
      console.error('Error creating COIN:', error);
      throw error;
    }

    return newCOIN.id;
  };

  const updateCOIN = async (coinId: string, updates: Partial<COIN>): Promise<void> => {
    const updatedCoins = coins.map(c =>
      c.id === coinId ? { ...c, ...updates } : c
    );
    setCoins(updatedCoins);

    try {
      await AsyncStorage.setItem(COINS_KEY, JSON.stringify(updatedCoins));
    } catch (error) {
      console.error('Error updating COIN:', error);
      throw error;
    }
  };

  const createProject = async (name: string): Promise<string> => {
    const now = new Date().toISOString();

    const newProject: Project = {
      id: generateProjectUUID(),
      name,
      description: '',
      clientOrDepartment: '',
      status: 'active',
      colorTag: '#007AFF',
      tags: [],
      createdDate: now,
      lastModifiedDate: now,
      coinCount: 0,
      owner: 'user-001',
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);

    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return newProject.id;
  };

  const toggleFavorite = (coinId: string) => {
    setCoins(prevCoins =>
      prevCoins.map(coin =>
        coin.id === coinId
          ? { ...coin, isFavorite: !coin.isFavorite }
          : coin
      )
    );
  };

  const duplicateCOIN = (coinId: string) => {
    setCoins(prevCoins => {
      const originalCoin = prevCoins.find(coin => coin.id === coinId);
      if (!originalCoin) return prevCoins;

      // Generate new UUID (simple implementation for Phase 1)
      const newId = `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Create duplicate with new metadata
      const duplicatedCoin: COIN = {
        ...originalCoin,
        id: newId,
        name: `${originalCoin.name} (Copy)`,
        status: 'draft', // New COINs start as draft
        processState: originalCoin.processState, // Inherit processState from original
        createdAt: now,
        updatedAt: now,
        lastAccessedAt: undefined, // Not accessed yet
        isFavorite: false, // Don't auto-favorite copies
        // Deep copy arrays to avoid reference sharing
        circles: JSON.parse(JSON.stringify(originalCoin.circles)),
        participants: JSON.parse(JSON.stringify(originalCoin.participants)),
        interactions: JSON.parse(JSON.stringify(originalCoin.interactions)),
      };

      // Add to beginning of array (most recent)
      return [duplicatedCoin, ...prevCoins];
    });
  };

  const reloadCoins = () => {
    setCoins(MOCK_COINS);
  };

  return (
    <COINContext.Provider value={{
      coins,
      projects,
      createCOIN,
      updateCOIN,
      toggleFavorite,
      duplicateCOIN,
      createProject,
      reloadCoins,
      sortOption,
      setSortOption,
      projectSortOption,
      setProjectSortOption,
      viewMode,
      setViewMode,
      groupByProject,
      setGroupByProject
    }}>
      {children}
    </COINContext.Provider>
  );
}

export function useCOINs() {
  const context = useContext(COINContext);
  if (context === undefined) {
    throw new Error('useCOINs must be used within a COINProvider');
  }
  return context;
}
