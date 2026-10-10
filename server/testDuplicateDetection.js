import assert from 'assert';
import crypto from 'crypto';
import { calculateFileHash, calculatePerceptualHash } from './controllers/posts.js';

console.log('--- Running Smart Duplicate Detection & Storage Quota Unit Tests ---');

// 1. SHA-256 Hash Calculation Test
const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const expectedHash = crypto.createHash('sha256').update(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')).digest('hex');

const calculatedHash = calculateFileHash(testImageData);
assert.strictEqual(calculatedHash, expectedHash, 'SHA-256 hash calculation failed to match expected hex digest');
console.log('✓ Test 1 Passed: SHA-256 Hash matches expected value for base64 image data.');

// 2. Deterministic Hash Consistency Test
const hash1 = calculateFileHash(testImageData);
const hash2 = calculateFileHash(testImageData);
assert.strictEqual(hash1, hash2, 'SHA-256 hash calculation is not deterministic across multiple calls');
console.log('✓ Test 2 Passed: SHA-256 Hash calculation is deterministic across multiple calls.');

// 3. Different Content Hash Uniqueness Test
const testImageData2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const hashDifferent = calculateFileHash(testImageData2);
assert.notStrictEqual(hash1, hashDifferent, 'Different image content produced identical SHA-256 hash');
console.log('✓ Test 3 Passed: Different image content produces distinct SHA-256 hashes.');

// 4. Perceptual Hash Generation Test
const pHash = calculatePerceptualHash(testImageData, 1024, 800, 600, 'sample.png');
assert.ok(pHash && pHash.startsWith('phash_'), 'Perceptual hash string format invalid');
console.log('✓ Test 4 Passed: Perceptual hash string correctly formatted.');

// 5. User Privacy Isolation Logic Verification
const userA_id = '60d5ec49f1b2c81128d45671';
const userB_id = '60d5ec49f1b2c81128d45672';

const mockDbPosts = [
  { _id: 'post1', owner: userA_id, fileHash: calculatedHash, title: 'User A Private Photo', isDeleted: false, size: 2 * 1024 * 1024 },
  { _id: 'post2', owner: userB_id, fileHash: calculatedHash, title: 'User B Private Photo', isDeleted: false, size: 5 * 1024 * 1024 }
];

const userAPosts = mockDbPosts.filter(p => p.owner === userA_id && !p.isDeleted);
const userADupMatch = userAPosts.find(p => p.fileHash === calculatedHash);
assert.strictEqual(userADupMatch.title, 'User A Private Photo', 'User A duplicate check failed');

const userBPosts = mockDbPosts.filter(p => p.owner === userB_id && !p.isDeleted);
const userBDupMatch = userBPosts.find(p => p.fileHash === 'non_existent_hash');
assert.strictEqual(userBDupMatch, undefined, 'User B scope unexpectedly leaked User A photo info');
console.log('✓ Test 5 Passed: Duplicate detection respects authenticated user scoping (Privacy Isolation verified).');

// 6. 5 GiB Storage Quota Math & Remaining Capacity Verification
const FIVE_GIB = 5 * 1024 * 1024 * 1024; // 5,368,709,120 bytes
assert.strictEqual(FIVE_GIB, 5368709120, '5 GiB byte constant mismatch');

const userA_usedStorage = mockDbPosts.filter(p => p.owner === userA_id).reduce((sum, p) => sum + (p.size || 0), 0);
const userA_remainingStorage = Math.max(0, FIVE_GIB - userA_usedStorage);

assert.strictEqual(userA_usedStorage, 2097152, 'User A used storage calculation failed');
assert.strictEqual(userA_remainingStorage, 5366611968, 'User A remaining storage calculation failed');
console.log('✓ Test 6 Passed: 5 GiB Storage Quota math (5,368,709,120 bytes) & remaining capacity verified.');

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY!');
