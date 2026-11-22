import * as Picker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { isManagedImage, persistImage, removeImage, pickImage } from '../src/services/imageService';

jest.mock('expo-image-picker', () => ({ getCameraPermissionsAsync: jest.fn(), requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-file-system', () => {
  const entries = new Map();
  return {
    Paths: { document: { uri: 'file:///documents/' } },
    Directory: class { constructor(parent, name) { this.uri = parent.uri + name + '/'; } create() {} },
    File: class {
      constructor(parent, name) { this.uri = name ? parent.uri + name : parent; }
      get exists() { return entries.has(this.uri); }
      get size() { return entries.get(this.uri) ?? 0; }
      async copy(destination) { entries.set(destination.uri, 20); }
      async delete() { entries.delete(this.uri); }
    },
  };
});
beforeEach(() => jest.clearAllMocks());
test.each(['file:///outside/photo.jpg', 'file:///documents/wardrobe-other/clothing-a.jpg', 'file:///documents/wardrobe/../clothing-a.jpg', 'file:///documents/wardrobe/%2e%2e/clothing-a.jpg', 'file:///documents/wardrobe/clothing-a.jpg/../../other', 'https://example.com/clothing-a.jpg'])('rejects unsafe deletion: %s', async (uri) => {
  const deletion = jest.spyOn(File.prototype, 'delete');
  expect(isManagedImage(uri)).toBe(false);
  await removeImage(uri);
  expect(deletion).not.toHaveBeenCalled();
  deletion.mockRestore();
});
test('copies to app documents and removes only that copy; missing file is harmless', async () => {
  const uri = await persistImage('file:///cache/selected.heic');
  expect(uri).toMatch(/^file:\/\/\/documents\/wardrobe\/clothing-.*\.heic$/);
  expect(new File(uri).exists).toBe(true);
  await removeImage(uri);
  expect(new File(uri).exists).toBe(false);
  await expect(removeImage(uri)).resolves.toBeUndefined();
});
test('copy failure is reported and partial file is removed', async () => {
  const copy = jest.spyOn(File.prototype, 'copy').mockRejectedValueOnce(new Error('Disk full'));
  await expect(persistImage('file:///cache/photo.jpg')).rejects.toThrow('Could not store this photo');
  copy.mockRestore();
});
test('permanently denied camera is not requested again or opened', async () => {
  Picker.getCameraPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
  expect(await pickImage('camera')).toEqual({ status: 'denied' });
  expect(Picker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
  expect(Picker.launchCameraAsync).not.toHaveBeenCalled();
});
test('camera permission is requested on action and cancellation is normal', async () => {
  Picker.getCameraPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
  Picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
  Picker.launchCameraAsync.mockResolvedValue({ canceled: true });
  expect(await pickImage('camera')).toEqual({ status: 'canceled' });
  expect(Picker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
});
test('image-only gallery selection returns a local URI without asking for camera access', async () => {
  Picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/photo.jpg' }] });
  expect(await pickImage('gallery')).toEqual({ status: 'selected', uri: 'file:///cache/photo.jpg' });
  expect(Picker.getCameraPermissionsAsync).not.toHaveBeenCalled();
  expect(Picker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
});
