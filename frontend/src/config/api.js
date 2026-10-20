export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const resolveApiAssetUrl = (assetUrl) => {
  if (!assetUrl || /^(data:|https?:\/\/|blob:)/i.test(assetUrl)) {
    return assetUrl;
  }

  return new URL(assetUrl, API_URL).toString();
};
