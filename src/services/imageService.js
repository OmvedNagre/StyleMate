import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const directory = () => new Directory(Paths.document, 'wardrobe');
/** Only direct children named by this service may be deleted. Reject traversal and encoded separators.
 * @param {string} uri */
export function isManagedImage(uri) {
  const prefix = directory().uri.replace(/\/$/, '') + '/';
  return uri.startsWith(prefix) && /^clothing-[a-z0-9-]+\.(jpg|jpeg|png|heic|heif|webp|avif)$/i.test(uri.slice(prefix.length));
}
/** @param {string} uri */
export async function removeImage(uri) {
  if (!isManagedImage(uri)) return;
  const file = new File(uri);
  if (file.exists) await file.delete();
}
/** @param {string} uri */
export async function persistImage(uri) {
  if (!/^(file|content):\/\//.test(uri)) throw new Error('Choose a local photo.');
  const folder = directory();
  folder.create({ idempotent: true, intermediates: true });
  const extension = uri.split(/[?#]/)[0].match(/\.(jpg|jpeg|png|heic|heif|webp|avif)$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const destination = new File(folder, `clothing-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}.${extension}`);
  try {
    await new File(uri).copy(destination);
    if (!destination.exists || destination.size === 0) throw new Error('Photo copy failed.');
    return destination.uri;
  } catch {
    try { await removeImage(destination.uri); } catch { /* Best-effort cleanup of an incomplete copy. */ }
    throw new Error('Could not store this photo. Free some device storage and try again.');
  }
}
/** @param {'camera' | 'gallery'} source */
export async function pickImage(source) {
  if (source === 'camera') {
    let permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
  }
  // The system image-only picker grants access to the selected photo; broad library access is unnecessary.
  const options = { mediaTypes: /** @type {import('expo-image-picker').MediaType[]} */ (['images']), allowsEditing: false, quality: 0.8 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return { status: 'canceled' };
  const uri = result.assets?.[0]?.uri;
  if (!uri) throw new Error('No photo was returned. Please try another image.');
  return { status: 'selected', uri };
}
