import React from 'react';
import { Alert, Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { DemoProvider, useDemo } from '../src/demo/DemoContext';
import ClothingForm from '../src/components/ClothingForm';
import Wardrobe from '../src/app/(tabs)/wardrobe';
import Discover from '../src/app/(tabs)/discover';
import Home from '../src/app/(tabs)/index';
import Profile from '../src/app/(tabs)/profile';
import Details from '../src/app/clothing/[id]';
import Edit from '../src/app/clothing/edit';
import Results from '../src/app/outfits/results';
import Saved from '../src/app/outfits/saved';
import History from '../src/app/outfits/history';
import NotFound from '../src/app/+not-found';
import OutfitCard from '../src/components/OutfitCard';
import { generateOutfits } from '../src/utils/recommendationEngine';
import { sampleClothing } from '../src/demo/data';
import { pickImage, persistImage } from '../src/services/imageService';
import { Button } from '../src/components/ui';

jest.mock('../src/services/database', () => {
  let state;
  const fresh = () => ({ onboarded: true, items: require('../src/demo/data').sampleClothing, savedOutfits: [], history: [], preferredStyle: 'any' });
  const repo = {
    load: jest.fn(async () => state), cleanup: jest.fn(async () => {}),
    saveItem: jest.fn(async (item) => { state = { ...state, items: state.items.some((row) => row.id === item.id) ? state.items.map((row) => row.id === item.id ? item : row) : [item, ...state.items] }; }),
    deleteItem: jest.fn(async (id) => { state = { ...state, items: state.items.filter((item) => item.id !== id) }; }),
    setFavorite: jest.fn(async (outfit, saved) => { state = { ...state, savedOutfits: saved ? [...state.savedOutfits.filter((entry) => entry.id !== outfit.id), outfit] : state.savedOutfits.filter((entry) => entry.id !== outfit.id) }; }),
    markWorn: jest.fn(async (entry) => { state = { ...state, history: [entry, ...state.history] }; }),
    setStyle: jest.fn(async (preferredStyle) => { state = { ...state, preferredStyle }; }),
    addSamples: jest.fn(async () => { state = fresh(); }),
    hideSamples: jest.fn(async () => { state = { ...state, items: [] }; }),
  };
  return { getRepository: jest.fn(async () => repo), resetFixture: () => { state = fresh(); } };
});

jest.mock('../src/services/imageService' , () => ({ pickImage: jest.fn(), persistImage: jest.fn(async () => 'file:///documents/wardrobe/clothing-test.jpg'), removeImage: jest.fn(async () => {}) }));

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return { Bookmark: View, Shirt: View, Sparkles: View };
});

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }, useLocalSearchParams: () => ({ id: 'demo-shirt' }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));

function Probe() {
  const demo = useDemo();
  return <><Text testID="state">{JSON.stringify({ items: demo.items, savedOutfits: demo.savedOutfits, history: demo.history })}</Text><Button title="Clear fixture" onPress={demo.clear} /><Button title="Remove shirt fixture" onPress={() => demo.deleteItem('demo-shirt')} /></>;
}
const fixtureOutfit = generateOutfits(sampleClothing, {}, [], Date.parse('2026-11-22T12:00:00Z')).outfits[0];
const mount = async (component) => { const result = await render(<DemoProvider>{component}<Probe /></DemoProvider>); await waitFor(() => expect(screen.getByTestId('state')).toBeTruthy()); return result; };
const state = () => JSON.parse(screen.getByTestId('state').props.children);
beforeEach(() => { jest.clearAllMocks(); require('../src/services/database').resetFixture(); });

test.each([Home, Wardrobe, Discover, Profile, Details, Edit, Results, Saved, History, NotFound])('%p renders the application shell', async (Component) => {
  await mount(<Component />);
  expect(screen.getByTestId('state')).toBeTruthy();
});

test('wardrobe filters and its empty view remain navigable', async () => {
  await mount(<Wardrobe />);
  await fireEvent.press(screen.getByLabelText('Browse by category: Footwear'));
  expect(screen.getByText('Clean white sneakers')).toBeTruthy();
  expect(screen.queryByText('The everyday shirt')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Browse by category: Accessory'));
  expect(screen.getByText('There are no pieces in this view.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Add a piece'));
  expect(router.push).toHaveBeenCalledWith('/clothing/add');
});

test('form validates and then adds a temporary item with a valid type after category changes', async () => {
  await mount(<ClothingForm />);
  await fireEvent.press(screen.getByText('Add to wardrobe'));
  expect(screen.getByText('Enter a name for this piece.')).toBeTruthy();
  expect(screen.getByText('Choose a clothing photo.')).toBeTruthy();
  expect(state().items).toHaveLength(5);
  await fireEvent.changeText(screen.getByLabelText('Clothing name'), '  My new trousers  ');
  pickImage.mockResolvedValueOnce({ status: 'selected', uri: 'file:///cache/picked.jpg' });
  await fireEvent.press(screen.getByText('Choose from Gallery'));
  await fireEvent.press(screen.getByLabelText('Category *: Bottomwear'));
  await fireEvent.press(screen.getByText('Add to wardrobe'));
  expect(state().items[0]).toMatchObject({ name: 'My new trousers', category: 'bottomwear', itemType: 'jeans', imageUri: 'file:///documents/wardrobe/clothing-test.jpg' });
  expect(router.replace).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/clothing/[id]' }));
});

test('edit updates the same record and does not duplicate it', async () => {
  await mount(<Edit />);
  await fireEvent.changeText(screen.getByLabelText('Clothing name'), 'Edited shirt');
  await fireEvent.press(screen.getByText('Update piece'));
  expect(state().items).toHaveLength(5);
  expect(state().items.find((item) => item.id === 'demo-shirt').name).toBe('Edited shirt');
});

test('Discover carries selections to the generator', async () => {
  await mount(<Discover />);
  await fireEvent.press(screen.getByLabelText('Weather · selected by you: Cold'));
  await fireEvent.press(screen.getByText('Generate outfits'));
  expect(router.push).toHaveBeenCalledWith({ pathname: '/outfits/results', params: { occasion: 'college', weather: 'cold', style: 'any', footwear: 'any' } });
});

test('favorites toggle and worn history is a single preserved snapshot', async () => {
  await mount(<OutfitCard outfit={fixtureOutfit} />);
  await fireEvent.press(screen.getByText('Save outfit'));
  expect(state().savedOutfits).toHaveLength(1);
  await fireEvent.press(screen.getByText('Remove from favorites'));
  expect(state().savedOutfits).toHaveLength(0);
  await fireEvent.press(screen.getByText('Mark as worn'));
  await fireEvent.press(screen.getByText('Wear again…'));
  expect(state().history).toHaveLength(1);
  await fireEvent.press(screen.getByText('Remove shirt fixture'));
  expect(state().history[0].items).toEqual(fixtureOutfit.items);
  expect(screen.getByText(/An item in this outfit is no longer available/)).toBeTruthy();
});

test('delete asks for confirmation before changing the collection', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await mount(<Details />);
  await fireEvent.press(screen.getByText('Remove piece'));
  expect(state().items).toHaveLength(5);
  expect(alert).toHaveBeenCalledWith('Remove this piece?', expect.any(String), expect.arrayContaining([expect.objectContaining({ text: 'Keep piece', style: 'cancel' }), expect.objectContaining({ text: 'Remove', style: 'destructive' })]));
  alert.mockRestore();
});

test('empty wardrobe and incomplete sample results are honest', async () => {
  await mount(<Results />);
  await fireEvent.press(screen.getByText('Clear fixture'));
  expect(screen.getByText('A few more pieces to work with')).toBeTruthy();
  expect(screen.queryByText(/Score ·/)).toBeNull();
});


test('failed photo copy leaves the wardrobe unchanged and allows retry', async () => {
  await mount(<ClothingForm />);
  await fireEvent.changeText(screen.getByLabelText('Clothing name'), 'Real shirt');
  pickImage.mockResolvedValueOnce({ status: 'selected', uri: 'file:///cache/photo.jpg' });
  await fireEvent.press(screen.getByText('Take Photo'));
  persistImage.mockRejectedValueOnce(new Error('Storage full'));
  await fireEvent.press(screen.getByText('Add to wardrobe'));
  expect(state().items).toHaveLength(5);
  expect(screen.getByText(/Could not save this piece/)).toBeTruthy();
  expect(router.replace).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('Add to wardrobe'));
  expect(state().items).toHaveLength(6);
});

test('picker cancellation is quiet and camera denial offers Settings', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await mount(<ClothingForm />);
  pickImage.mockResolvedValueOnce({ status: 'canceled' });
  await fireEvent.press(screen.getByText('Choose from Gallery'));
  expect(alert).not.toHaveBeenCalled();
  expect(state().items).toHaveLength(5);
  pickImage.mockResolvedValueOnce({ status: 'denied' });
  await fireEvent.press(screen.getByText('Take Photo'));
  expect(alert).toHaveBeenCalledWith('Camera access needed', expect.any(String), expect.arrayContaining([expect.objectContaining({ text: 'Open Settings' })]));
  alert.mockRestore();
});

test('database startup failure offers retry without resetting stored data', async () => {
  const { getRepository } = require('../src/services/database');
  getRepository.mockRejectedValueOnce(new Error('Database busy'));
  await render(<DemoProvider><Wardrobe /><Probe /></DemoProvider>);
  await waitFor(() => expect(screen.getByText('Storage needs attention')).toBeTruthy());
  expect(screen.queryByTestId('state')).toBeNull();
  await fireEvent.press(screen.getByText('Retry'));
  await waitFor(() => expect(screen.getByTestId('state')).toBeTruthy());
  expect(state().items).toHaveLength(5);
});

test('database save failure cleans up the new copy and retains existing records', async () => {
  const repository = await require('../src/services/database').getRepository();
  const { removeImage } = require('../src/services/imageService');
  await mount(<ClothingForm />);
  await fireEvent.changeText(screen.getByLabelText('Clothing name'), 'Unsaved photo');
  pickImage.mockResolvedValueOnce({ status: 'selected', uri: 'file:///cache/new.jpg' });
  await fireEvent.press(screen.getByText('Choose from Gallery'));
  repository.saveItem.mockRejectedValueOnce(new Error('Disk full'));
  await fireEvent.press(screen.getByText('Add to wardrobe'));
  expect(state().items).toHaveLength(5);
  expect(removeImage).toHaveBeenCalledWith('file:///documents/wardrobe/clothing-test.jpg');
  expect(router.replace).not.toHaveBeenCalled();
});

test('favorite write failure does not show a saved state', async () => {
  const repository = await require('../src/services/database').getRepository();
  await mount(<OutfitCard outfit={fixtureOutfit} />);
  repository.setFavorite.mockRejectedValueOnce(new Error('Database locked'));
  await fireEvent.press(screen.getByText('Save outfit'));
  expect(state().savedOutfits).toHaveLength(0);
  expect(screen.getByText('Could not store this change. Please try again.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Save outfit'));
  expect(state().savedOutfits).toHaveLength(1);
});

test('repeat wear requires confirmation and adds one new snapshot', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await mount(<OutfitCard outfit={fixtureOutfit} />);
  await fireEvent.press(screen.getByText('Mark as worn'));
  const original = state().history[0];
  await fireEvent.press(screen.getByText('Wear again…'));
  expect(state().history).toHaveLength(1);
  const buttons = alert.mock.calls.at(-1)[2];
  expect(buttons[0].text).toBe('Cancel');
  await require('@testing-library/react-native').act(async () => { await buttons[1].onPress(); });
  expect(state().history).toHaveLength(2);
  expect(state().history[1]).toEqual(original);
  alert.mockRestore();
});

test('saved missing pieces retain their names and disable wear recording', async () => {
  await mount(<OutfitCard outfit={fixtureOutfit} />);
  await fireEvent.press(screen.getByText('Save outfit'));
  await fireEvent.press(screen.getByText('Remove shirt fixture'));
  expect(screen.getByText('The everyday shirt · No longer in your wardrobe')).toBeTruthy();
  await fireEvent.press(screen.getByText('Mark as worn'));
  expect(state().history).toHaveLength(0);
  await fireEvent.press(screen.getByText('Remove from favorites'));
  expect(state().savedOutfits).toHaveLength(0);
});

test('cleanup failure does not block a readable wardrobe at startup', async () => {
  const repository = await require('../src/services/database').getRepository();
  repository.cleanup.mockRejectedValueOnce(new Error('Cleanup busy'));
  await mount(<Wardrobe />);
  expect(state().items).toHaveLength(5);
});

test('wear recording rejects an outfit invalidated after the card rendered', async () => {
  const repository = await require('../src/services/database').getRepository();
  await mount(<OutfitCard outfit={fixtureOutfit} />);
  await repository.deleteItem('demo-shirt');
  await fireEvent.press(screen.getByText('Mark as worn'));
  expect(repository.markWorn).not.toHaveBeenCalled();
  expect(screen.getByText('Could not store this change. Please try again.')).toBeTruthy();
});

test('failed photo display shows a recoverable fallback', async () => {
  const { ClothingImage } = require('../src/components/ClothingCard');
  await render(<ClothingImage image="" imageUri="file:///missing.jpg" />);
  await fireEvent(screen.getByLabelText('Clothing photo'), 'error');
  expect(screen.getByText('Photo unavailable. Edit this piece to choose a replacement.')).toBeTruthy();
});

test('onboarding offers skip and completes from slide three', async () => {
  const Onboarding = require('../src/components/Onboarding').default;
  const onFinish = jest.fn(async () => {});
  await render(<Onboarding onFinish={onFinish} />);
  expect(screen.getByText('Skip')).toBeTruthy();
  await fireEvent.press(screen.getByText('Next'));
  await fireEvent.press(screen.getByText('Next'));
  await fireEvent.press(screen.getByText('Start for free'));
  expect(onFinish).toHaveBeenCalledTimes(1);
});

test('skipping onboarding completes it from the first slide', async () => {
  const Onboarding = require('../src/components/Onboarding').default;
  const onFinish = jest.fn(async () => {});
  await render(<Onboarding onFinish={onFinish} />);
  await fireEvent.press(screen.getByText('Skip'));
  expect(onFinish).toHaveBeenCalledTimes(1);
});
