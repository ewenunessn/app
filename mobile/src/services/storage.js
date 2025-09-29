import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_ID: '@quiz_app:user_id',
  USER_NAME: '@quiz_app:user_name',
  USER_AVATAR: '@quiz_app:user_avatar',
};

export const storageService = {
  // Salvar dados do usuário
  async saveUser(userId, userName, avatar = '🦊') {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_ID, userId.toString()],
        [STORAGE_KEYS.USER_NAME, userName],
        [STORAGE_KEYS.USER_AVATAR, avatar],
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      return false;
    }
  },

  // Obter dados do usuário
  async getUser() {
    try {
      const values = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_AVATAR,
      ]);

      const userData = {};
      values.forEach(([key, value]) => {
        if (key === STORAGE_KEYS.USER_ID) userData.userId = value;
        if (key === STORAGE_KEYS.USER_NAME) userData.userName = value;
        if (key === STORAGE_KEYS.USER_AVATAR) userData.avatar = value || '🦊';
      });

      return userData;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return {};
    }
  },

  // Limpar dados do usuário
  async clearUser() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_AVATAR,
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao limpar usuário:', error);
      return false;
    }
  },

  // Verificar se usuário existe
  async hasUser() {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const userName = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      return !!(userId && userName);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return false;
    }
  },
};