// same config as backend


export const appConfig = {
  chunkedUpload: {
    threshold: parseInt(import.meta.env.VITE_CHUNK_SIZE_THRESHOLD) || 100 * 1024 * 1024,
    minChunkSize: parseInt(import.meta.env.VITE_MIN_CHUNK_SIZE) || 40 * 1024 * 1024,
    maxChunkSize: parseInt(import.meta.env.VITE_MAX_CHUNK_SIZE) || 100 * 1024 * 1024,
  },
};