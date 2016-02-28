#ifndef SRC_NODE_CRYPTO_GROUPS_H_
#define SRC_NODE_CRYPTO_GROUPS_H_

/*
    These modular groups were literally taken from:
       * RFC 2412 (groups 1 and 2)
       * RFC 3526 (groups 5, 14, 15, 16, 17 and 18)
    They all use 2 as a generator.
*/


static const unsigned char two_generator[] = { 2 };

static const unsigned char group_modp1[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x3a, 0x36, 0x20, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff };

static const unsigned char group_modp2[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe6, 0x53, 0x81,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff };

static const unsigned char group_modp5[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x23, 0x73, 0x27, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff };

static const unsigned char group_modp14[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x18, 0x21, 0x7c, 0x32, 0x90, 0x5e, 0x46, 0x2e, 0x36,
  0xce, 0x3b, 0xe3, 0x9e, 0x77, 0x2c, 0x18, 0x0e, 0x86, 0x03,
  0x9b, 0x27, 0x83, 0xa2, 0xec, 0x07, 0xa2, 0x8f, 0xb5, 0xc5,
  0x5d, 0xf0, 0x6f, 0x4c, 0x52, 0xc9, 0xde, 0x2b, 0xcb, 0xf6,
  0x95, 0x58, 0x17, 0x18, 0x39, 0x95, 0x49, 0x7c, 0xea, 0x95,
  0x6a, 0xe5, 0x15, 0xd2, 0x26, 0x18, 0x98, 0xfa, 0x05, 0x10,
  0x15, 0x72, 0x8e, 0x5a, 0x8a, 0xac, 0xaa, 0x68, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff };

static const unsigned char group_modp15[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x18, 0x21, 0x7c, 0x32, 0x90, 0x5e, 0x46, 0x2e, 0x36,
  0xce, 0x3b, 0xe3, 0x9e, 0x77, 0x2c, 0x18, 0x0e, 0x86, 0x03,
  0x9b, 0x27, 0x83, 0xa2, 0xec, 0x07, 0xa2, 0x8f, 0xb5, 0xc5,
  0x5d, 0xf0, 0x6f, 0x4c, 0x52, 0xc9, 0xde, 0x2b, 0xcb, 0xf6,
  0x95, 0x58, 0x17, 0x18, 0x39, 0x95, 0x49, 0x7c, 0xea, 0x95,
  0x6a, 0xe5, 0x15, 0xd2, 0x26, 0x18, 0x98, 0xfa, 0x05, 0x10,
  0x15, 0x72, 0x8e, 0x5a, 0x8a, 0xaa, 0xc4, 0x2d, 0xad, 0x33,
  0x17, 0x0d, 0x04, 0x50, 0x7a, 0x33, 0xa8, 0x55, 0x21, 0xab,
  0xdf, 0x1c, 0xba, 0x64, 0xec, 0xfb, 0x85, 0x04, 0x58, 0xdb,
  0xef, 0x0a, 0x8a, 0xea, 0x71, 0x57, 0x5d, 0x06, 0x0c, 0x7d,
  0xb3, 0x97, 0x0f, 0x85, 0xa6, 0xe1, 0xe4, 0xc7, 0xab, 0xf5,
  0xae, 0x8c, 0xdb, 0x09, 0x33, 0xd7, 0x1e, 0x8c, 0x94, 0xe0,
  0x4a, 0x25, 0x61, 0x9d, 0xce, 0xe3, 0xd2, 0x26, 0x1a, 0xd2,
  0xee, 0x6b, 0xf1, 0x2f, 0xfa, 0x06, 0xd9, 0x8a, 0x08, 0x64,
  0xd8, 0x76, 0x02, 0x73, 0x3e, 0xc8, 0x6a, 0x64, 0x52, 0x1f,
  0x2b, 0x18, 0x17, 0x7b, 0x20, 0x0c, 0xbb, 0xe1, 0x17, 0x57,
  0x7a, 0x61, 0x5d, 0x6c, 0x77, 0x09, 0x88, 0xc0, 0xba, 0xd9,
  0x46, 0xe2, 0x08, 0xe2, 0x4f, 0xa0, 0x74, 0xe5, 0xab, 0x31,
  0x43, 0xdb, 0x5b, 0xfc, 0xe0, 0xfd, 0x10, 0x8e, 0x4b, 0x82,
  0xd1, 0x20, 0xa9, 0x3a, 0xd2, 0xca, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff };

static const unsigned char group_modp16[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x18, 0x21, 0x7c, 0x32, 0x90, 0x5e, 0x46, 0x2e, 0x36,
  0xce, 0x3b, 0xe3, 0x9e, 0x77, 0x2c, 0x18, 0x0e, 0x86, 0x03,
  0x9b, 0x27, 0x83, 0xa2, 0xec, 0x07, 0xa2, 0x8f, 0xb5, 0xc5,
  0x5d, 0xf0, 0x6f, 0x4c, 0x52, 0xc9, 0xde, 0x2b, 0xcb, 0xf6,
  0x95, 0x58, 0x17, 0x18, 0x39, 0x95, 0x49, 0x7c, 0xea, 0x95,
  0x6a, 0xe5, 0x15, 0xd2, 0x26, 0x18, 0x98, 0xfa, 0x05, 0x10,
  0x15, 0x72, 0x8e, 0x5a, 0x8a, 0xaa, 0xc4, 0x2d, 0xad, 0x33,
  0x17, 0x0d, 0x04, 0x50, 0x7a, 0x33, 0xa8, 0x55, 0x21, 0xab,
  0xdf, 0x1c, 0xba, 0x64, 0xec, 0xfb, 0x85, 0x04, 0x58, 0xdb,
  0xef, 0x0a, 0x8a, 0xea, 0x71, 0x57, 0x5d, 0x06, 0x0c, 0x7d,
  0xb3, 0x97, 0x0f, 0x85, 0xa6, 0xe1, 0xe4, 0xc7, 0xab, 0xf5,
  0xae, 0x8c, 0xdb, 0x09, 0x33, 0xd7, 0x1e, 0x8c, 0x94, 0xe0,
  0x4a, 0x25, 0x61, 0x9d, 0xce, 0xe3, 0xd2, 0x26, 0x1a, 0xd2,
  0xee, 0x6b, 0xf1, 0x2f, 0xfa, 0x06, 0xd9, 0x8a, 0x08, 0x64,
  0xd8, 0x76, 0x02, 0x73, 0x3e, 0xc8, 0x6a, 0x64, 0x52, 0x1f,
  0x2b, 0x18, 0x17, 0x7b, 0x20, 0x0c, 0xbb, 0xe1, 0x17, 0x57,
  0x7a, 0x61, 0x5d, 0x6c, 0x77, 0x09, 0x88, 0xc0, 0xba, 0xd9,
  0x46, 0xe2, 0x08, 0xe2, 0x4f, 0xa0, 0x74, 0xe5, 0xab, 0x31,
  0x43, 0xdb, 0x5b, 0xfc, 0xe0, 0xfd, 0x10, 0x8e, 0x4b, 0x82,
  0xd1, 0x20, 0xa9, 0x21, 0x08, 0x01, 0x1a, 0x72, 0x3c, 0x12,
  0xa7, 0x87, 0xe6, 0xd7, 0x88, 0x71, 0x9a, 0x10, 0xbd, 0xba,
  0x5b, 0x26, 0x99, 0xc3, 0x27, 0x18, 0x6a, 0xf4, 0xe2, 0x3c,
  0x1a, 0x94, 0x68, 0x34, 0xb6, 0x15, 0x0b, 0xda, 0x25, 0x83,
  0xe9, 0xca, 0x2a, 0xd4, 0x4c, 0xe8, 0xdb, 0xbb, 0xc2, 0xdb,
  0x04, 0xde, 0x8e, 0xf9, 0x2e, 0x8e, 0xfc, 0x14, 0x1f, 0xbe,
  0xca, 0xa6, 0x28, 0x7c, 0x59, 0x47, 0x4e, 0x6b, 0xc0, 0x5d,
  0x99, 0xb2, 0x96, 0x4f, 0xa0, 0x90, 0xc3, 0xa2, 0x23, 0x3b,
  0xa1, 0x86, 0x51, 0x5b, 0xe7, 0xed, 0x1f, 0x61, 0x29, 0x70,
  0xce, 0xe2, 0xd7, 0xaf, 0xb8, 0x1b, 0xdd, 0x76, 0x21, 0x70,
  0x48, 0x1c, 0xd0, 0x06, 0x91, 0x27, 0xd5, 0xb0, 0x5a, 0xa9,
  0x93, 0xb4, 0xea, 0x98, 0x8d, 0x8f, 0xdd, 0xc1, 0x86, 0xff,
  0xb7, 0xdc, 0x90, 0xa6, 0xc0, 0x8f, 0x4d, 0xf4, 0x35, 0xc9,
  0x34, 0x06, 0x31, 0x99, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff };

static const unsigned char group_modp17[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x18, 0x21, 0x7c, 0x32, 0x90, 0x5e, 0x46, 0x2e, 0x36,
  0xce, 0x3b, 0xe3, 0x9e, 0x77, 0x2c, 0x18, 0x0e, 0x86, 0x03,
  0x9b, 0x27, 0x83, 0xa2, 0xec, 0x07, 0xa2, 0x8f, 0xb5, 0xc5,
  0x5d, 0xf0, 0x6f, 0x4c, 0x52, 0xc9, 0xde, 0x2b, 0xcb, 0xf6,
  0x95, 0x58, 0x17, 0x18, 0x39, 0x95, 0x49, 0x7c, 0xea, 0x95,
  0x6a, 0xe5, 0x15, 0xd2, 0x26, 0x18, 0x98, 0xfa, 0x05, 0x10,
  0x15, 0x72, 0x8e, 0x5a, 0x8a, 0xaa, 0xc4, 0x2d, 0xad, 0x33,
  0x17, 0x0d, 0x04, 0x50, 0x7a, 0x33, 0xa8, 0x55, 0x21, 0xab,
  0xdf, 0x1c, 0xba, 0x64, 0xec, 0xfb, 0x85, 0x04, 0x58, 0xdb,
  0xef, 0x0a, 0x8a, 0xea, 0x71, 0x57, 0x5d, 0x06, 0x0c, 0x7d,
  0xb3, 0x97, 0x0f, 0x85, 0xa6, 0xe1, 0xe4, 0xc7, 0xab, 0xf5,
  0xae, 0x8c, 0xdb, 0x09, 0x33, 0xd7, 0x1e, 0x8c, 0x94, 0xe0,
  0x4a, 0x25, 0x61, 0x9d, 0xce, 0xe3, 0xd2, 0x26, 0x1a, 0xd2,
  0xee, 0x6b, 0xf1, 0x2f, 0xfa, 0x06, 0xd9, 0x8a, 0x08, 0x64,
  0xd8, 0x76, 0x02, 0x73, 0x3e, 0xc8, 0x6a, 0x64, 0x52, 0x1f,
  0x2b, 0x18, 0x17, 0x7b, 0x20, 0x0c, 0xbb, 0xe1, 0x17, 0x57,
  0x7a, 0x61, 0x5d, 0x6c, 0x77, 0x09, 0x88, 0xc0, 0xba, 0xd9,
  0x46, 0xe2, 0x08, 0xe2, 0x4f, 0xa0, 0x74, 0xe5, 0xab, 0x31,
  0x43, 0xdb, 0x5b, 0xfc, 0xe0, 0xfd, 0x10, 0x8e, 0x4b, 0x82,
  0xd1, 0x20, 0xa9, 0x21, 0x08, 0x01, 0x1a, 0x72, 0x3c, 0x12,
  0xa7, 0x87, 0xe6, 0xd7, 0x88, 0x71, 0x9a, 0x10, 0xbd, 0xba,
  0x5b, 0x26, 0x99, 0xc3, 0x27, 0x18, 0x6a, 0xf4, 0xe2, 0x3c,
  0x1a, 0x94, 0x68, 0x34, 0xb6, 0x15, 0x0b, 0xda, 0x25, 0x83,
  0xe9, 0xca, 0x2a, 0xd4, 0x4c, 0xe8, 0xdb, 0xbb, 0xc2, 0xdb,
  0x04, 0xde, 0x8e, 0xf9, 0x2e, 0x8e, 0xfc, 0x14, 0x1f, 0xbe,
  0xca, 0xa6, 0x28, 0x7c, 0x59, 0x47, 0x4e, 0x6b, 0xc0, 0x5d,
  0x99, 0xb2, 0x96, 0x4f, 0xa0, 0x90, 0xc3, 0xa2, 0x23, 0x3b,
  0xa1, 0x86, 0x51, 0x5b, 0xe7, 0xed, 0x1f, 0x61, 0x29, 0x70,
  0xce, 0xe2, 0xd7, 0xaf, 0xb8, 0x1b, 0xdd, 0x76, 0x21, 0x70,
  0x48, 0x1c, 0xd0, 0x06, 0x91, 0x27, 0xd5, 0xb0, 0x5a, 0xa9,
  0x93, 0xb4, 0xea, 0x98, 0x8d, 0x8f, 0xdd, 0xc1, 0x86, 0xff,
  0xb7, 0xdc, 0x90, 0xa6, 0xc0, 0x8f, 0x4d, 0xf4, 0x35, 0xc9,
  0x34, 0x02, 0x84, 0x92, 0x36, 0xc3, 0xfa, 0xb4, 0xd2, 0x7c,
  0x70, 0x26, 0xc1, 0xd4, 0xdc, 0xb2, 0x60, 0x26, 0x46, 0xde,
  0xc9, 0x75, 0x1e, 0x76, 0x3d, 0xba, 0x37, 0xbd, 0xf8, 0xff,
  0x94, 0x06, 0xad, 0x9e, 0x53, 0x0e, 0xe5, 0xdb, 0x38, 0x2f,
  0x41, 0x30, 0x01, 0xae, 0xb0, 0x6a, 0x53, 0xed, 0x90, 0x27,
  0xd8, 0x31, 0x17, 0x97, 0x27, 0xb0, 0x86, 0x5a, 0x89, 0x18,
  0xda, 0x3e, 0xdb, 0xeb, 0xcf, 0x9b, 0x14, 0xed, 0x44, 0xce,
  0x6c, 0xba, 0xce, 0xd4, 0xbb, 0x1b, 0xdb, 0x7f, 0x14, 0x47,
  0xe6, 0xcc, 0x25, 0x4b, 0x33, 0x20, 0x51, 0x51, 0x2b, 0xd7,
  0xaf, 0x42, 0x6f, 0xb8, 0xf4, 0x01, 0x37, 0x8c, 0xd2, 0xbf,
  0x59, 0x83, 0xca, 0x01, 0xc6, 0x4b, 0x92, 0xec, 0xf0, 0x32,
  0xea, 0x15, 0xd1, 0x72, 0x1d, 0x03, 0xf4, 0x82, 0xd7, 0xce,
  0x6e, 0x74, 0xfe, 0xf6, 0xd5, 0x5e, 0x70, 0x2f, 0x46, 0x98,
  0x0c, 0x82, 0xb5, 0xa8, 0x40, 0x31, 0x90, 0x0b, 0x1c, 0x9e,
  0x59, 0xe7, 0xc9, 0x7f, 0xbe, 0xc7, 0xe8, 0xf3, 0x23, 0xa9,
  0x7a, 0x7e, 0x36, 0xcc, 0x88, 0xbe, 0x0f, 0x1d, 0x45, 0xb7,
  0xff, 0x58, 0x5a, 0xc5, 0x4b, 0xd4, 0x07, 0xb2, 0x2b, 0x41,
  0x54, 0xaa, 0xcc, 0x8f, 0x6d, 0x7e, 0xbf, 0x48, 0xe1, 0xd8,
  0x14, 0xcc, 0x5e, 0xd2, 0x0f, 0x80, 0x37, 0xe0, 0xa7, 0x97,
  0x15, 0xee, 0xf2, 0x9b, 0xe3, 0x28, 0x06, 0xa1, 0xd5, 0x8b,
  0xb7, 0xc5, 0xda, 0x76, 0xf5, 0x50, 0xaa, 0x3d, 0x8a, 0x1f,
  0xbf, 0xf0, 0xeb, 0x19, 0xcc, 0xb1, 0xa3, 0x13, 0xd5, 0x5c,
  0xda, 0x56, 0xc9, 0xec, 0x2e, 0xf2, 0x96, 0x32, 0x38, 0x7f,
  0xe8, 0xd7, 0x6e, 0x3c, 0x04, 0x68, 0x04, 0x3e, 0x8f, 0x66,
  0x3f, 0x48, 0x60, 0xee, 0x12, 0xbf, 0x2d, 0x5b, 0x0b, 0x74,
  0x74, 0xd6, 0xe6, 0x94, 0xf9, 0x1e, 0x6d, 0xcc, 0x40, 0x24,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff };

static const unsigned char group_modp18[] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc9, 0x0f,
  0xda, 0xa2, 0x21, 0x68, 0xc2, 0x34, 0xc4, 0xc6, 0x62, 0x8b,
  0x80, 0xdc, 0x1c, 0xd1, 0x29, 0x02, 0x4e, 0x08, 0x8a, 0x67,
  0xcc, 0x74, 0x02, 0x0b, 0xbe, 0xa6, 0x3b, 0x13, 0x9b, 0x22,
  0x51, 0x4a, 0x08, 0x79, 0x8e, 0x34, 0x04, 0xdd, 0xef, 0x95,
  0x19, 0xb3, 0xcd, 0x3a, 0x43, 0x1b, 0x30, 0x2b, 0x0a, 0x6d,
  0xf2, 0x5f, 0x14, 0x37, 0x4f, 0xe1, 0x35, 0x6d, 0x6d, 0x51,
  0xc2, 0x45, 0xe4, 0x85, 0xb5, 0x76, 0x62, 0x5e, 0x7e, 0xc6,
  0xf4, 0x4c, 0x42, 0xe9, 0xa6, 0x37, 0xed, 0x6b, 0x0b, 0xff,
  0x5c, 0xb6, 0xf4, 0x06, 0xb7, 0xed, 0xee, 0x38, 0x6b, 0xfb,
  0x5a, 0x89, 0x9f, 0xa5, 0xae, 0x9f, 0x24, 0x11, 0x7c, 0x4b,
  0x1f, 0xe6, 0x49, 0x28, 0x66, 0x51, 0xec, 0xe4, 0x5b, 0x3d,
  0xc2, 0x00, 0x7c, 0xb8, 0xa1, 0x63, 0xbf, 0x05, 0x98, 0xda,
  0x48, 0x36, 0x1c, 0x55, 0xd3, 0x9a, 0x69, 0x16, 0x3f, 0xa8,
  0xfd, 0x24, 0xcf, 0x5f, 0x83, 0x65, 0x5d, 0x23, 0xdc, 0xa3,
  0xad, 0x96, 0x1c, 0x62, 0xf3, 0x56, 0x20, 0x85, 0x52, 0xbb,
  0x9e, 0xd5, 0x29, 0x07, 0x70, 0x96, 0x96, 0x6d, 0x67, 0x0c,
  0x35, 0x4e, 0x4a, 0xbc, 0x98, 0x04, 0xf1, 0x74, 0x6c, 0x08,
  0xca, 0x18, 0x21, 0x7c, 0x32, 0x90, 0x5e, 0x46, 0x2e, 0x36,
  0xce, 0x3b, 0xe3, 0x9e, 0x77, 0x2c, 0x18, 0x0e, 0x86, 0x03,
  0x9b, 0x27, 0x83, 0xa2, 0xec, 0x07, 0xa2, 0x8f, 0xb5, 0xc5,
  0x5d, 0xf0, 0x6f, 0x4c, 0x52, 0xc9, 0xde, 0x2b, 0xcb, 0xf6,
  0x95, 0x58, 0x17, 0x18, 0x39, 0x95, 0x49, 0x7c, 0xea, 0x95,
  0x6a, 0xe5, 0x15, 0xd2, 0x26, 0x18, 0x98, 0xfa, 0x05, 0x10,
  0x15, 0x72, 0x8e, 0x5a, 0x8a, 0xaa, 0xc4, 0x2d, 0xad, 0x33,
  0x17, 0x0d, 0x04, 0x50, 0x7a, 0x33, 0xa8, 0x55, 0x21, 0xab,
  0xdf, 0x1c, 0xba, 0x64, 0xec, 0xfb, 0x85, 0x04, 0x58, 0xdb,
  0xef, 0x0a, 0x8a, 0xea, 0x71, 0x57, 0x5d, 0x06, 0x0c, 0x7d,
  0xb3, 0x97, 0x0f, 0x85, 0xa6, 0xe1, 0xe4, 0xc7, 0xab, 0xf5,
  0xae, 0x8c, 0xdb, 0x09, 0x33, 0xd7, 0x1e, 0x8c, 0x94, 0xe0,
  0x4a, 0x25, 0x61, 0x9d, 0xce, 0xe3, 0xd2, 0x26, 0x1a, 0xd2,
  0xee, 0x6b, 0xf1, 0x2f, 0xfa, 0x06, 0xd9, 0x8a, 0x08, 0x64,
  0xd8, 0x76, 0x02, 0x73, 0x3e, 0xc8, 0x6a, 0x64, 0x52, 0x1f,
  0x2b, 0x18, 0x17, 0x7b, 0x20, 0x0c, 0xbb, 0xe1, 0x17, 0x57,
  0x7a, 0x61, 0x5d, 0x6c, 0x77, 0x09, 0x88, 0xc0, 0xba, 0xd9,
  0x46, 0xe2, 0x08, 0xe2, 0x4f, 0xa0, 0x74, 0xe5, 0xab, 0x31,
  0x43, 0xdb, 0x5b, 0xfc, 0xe0, 0xfd, 0x10, 0x8e, 0x4b, 0x82,
  0xd1, 0x20, 0xa9, 0x21, 0x08, 0x01, 0x1a, 0x72, 0x3c, 0x12,
  0xa7, 0x87, 0xe6, 0xd7, 0x88, 0x71, 0x9a, 0x10, 0xbd, 0xba,
  0x5b, 0x26, 0x99, 0xc3, 0x27, 0x18, 0x6a, 0xf4, 0xe2, 0x3c,
  0x1a, 0x94, 0x68, 0x34, 0xb6, 0x15, 0x0b, 0xda, 0x25, 0x83,
  0xe9, 0xca, 0x2a, 0xd4, 0x4c, 0xe8, 0xdb, 0xbb, 0xc2, 0xdb,
  0x04, 0xde, 0x8e, 0xf9, 0x2e, 0x8e, 0xfc, 0x14, 0x1f, 0xbe,
  0xca, 0xa6, 0x28, 0x7c, 0x59, 0x47, 0x4e, 0x6b, 0xc0, 0x5d,
  0x99, 0xb2, 0x96, 0x4f, 0xa0, 0x90, 0xc3, 0xa2, 0x23, 0x3b,
  0xa1, 0x86, 0x51, 0x5b, 0xe7, 0xed, 0x1f, 0x61, 0x29, 0x70,
  0xce, 0xe2, 0xd7, 0xaf, 0xb8, 0x1b, 0xdd, 0x76, 0x21, 0x70,
  0x48, 0x1c, 0xd0, 0x06, 0x91, 0x27, 0xd5, 0xb0, 0x5a, 0xa9,
  0x93, 0xb4, 0xea, 0x98, 0x8d, 0x8f, 0xdd, 0xc1, 0x86, 0xff,
  0xb7, 0xdc, 0x90, 0xa6, 0xc0, 0x8f, 0x4d, 0xf4, 0x35, 0xc9,
  0x34, 0x02, 0x84, 0x92, 0x36, 0xc3, 0xfa, 0xb4, 0xd2, 0x7c,
  0x70, 0x26, 0xc1, 0xd4, 0xdc, 0xb2, 0x60, 0x26, 0x46, 0xde,
  0xc9, 0x75, 0x1e, 0x76, 0x3d, 0xba, 0x37, 0xbd, 0xf8, 0xff,
  0x94, 0x06, 0xad, 0x9e, 0x53, 0x0e, 0xe5, 0xdb, 0x38, 0x2f,
  0x41, 0x30, 0x01, 0xae, 0xb0, 0x6a, 0x53, 0xed, 0x90, 0x27,
  0xd8, 0x31, 0x17, 0x97, 0x27, 0xb0, 0x86, 0x5a, 0x89, 0x18,
  0xda, 0x3e, 0xdb, 0xeb, 0xcf, 0x9b, 0x14, 0xed, 0x44, 0xce,
  0x6c, 0xba, 0xce, 0xd4, 0xbb, 0x1b, 0xdb, 0x7f, 0x14, 0x47,
  0xe6, 0xcc, 0x25, 0x4b, 0x33, 0x20, 0x51, 0x51, 0x2b, 0xd7,
  0xaf, 0x42, 0x6f, 0xb8, 0xf4, 0x01, 0x37, 0x8c, 0xd2, 0xbf,
  0x59, 0x83, 0xca, 0x01, 0xc6, 0x4b, 0x92, 0xec, 0xf0, 0x32,
  0xea, 0x15, 0xd1, 0x72, 0x1d, 0x03, 0xf4, 0x82, 0xd7, 0xce,
  0x6e, 0x74, 0xfe, 0xf6, 0xd5, 0x5e, 0x70, 0x2f, 0x46, 0x98,
  0x0c, 0x82, 0xb5, 0xa8, 0x40, 0x31, 0x90, 0x0b, 0x1c, 0x9e,
  0x59, 0xe7, 0xc9, 0x7f, 0xbe, 0xc7, 0xe8, 0xf3, 0x23, 0xa9,
  0x7a, 0x7e, 0x36, 0xcc, 0x88, 0xbe, 0x0f, 0x1d, 0x45, 0xb7,
  0xff, 0x58, 0x5a, 0xc5, 0x4b, 0xd4, 0x07, 0xb2, 0x2b, 0x41,
  0x54, 0xaa, 0xcc, 0x8f, 0x6d, 0x7e, 0xbf, 0x48, 0xe1, 0xd8,
  0x14, 0xcc, 0x5e, 0xd2, 0x0f, 0x80, 0x37, 0xe0, 0xa7, 0x97,
  0x15, 0xee, 0xf2, 0x9b, 0xe3, 0x28, 0x06, 0xa1, 0xd5, 0x8b,
  0xb7, 0xc5, 0xda, 0x76, 0xf5, 0x50, 0xaa, 0x3d, 0x8a, 0x1f,
  0xbf, 0xf0, 0xeb, 0x19, 0xcc, 0xb1, 0xa3, 0x13, 0xd5, 0x5c,
  0xda, 0x56, 0xc9, 0xec, 0x2e, 0xf2, 0x96, 0x32, 0x38, 0x7f,
  0xe8, 0xd7, 0x6e, 0x3c, 0x04, 0x68, 0x04, 0x3e, 0x8f, 0x66,
  0x3f, 0x48, 0x60, 0xee, 0x12, 0xbf, 0x2d, 0x5b, 0x0b, 0x74,
  0x74, 0xd6, 0xe6, 0x94, 0xf9, 0x1e, 0x6d, 0xbe, 0x11, 0x59,
  0x74, 0xa3, 0x92, 0x6f, 0x12, 0xfe, 0xe5, 0xe4, 0x38, 0x77,
  0x7c, 0xb6, 0xa9, 0x32, 0xdf, 0x8c, 0xd8, 0xbe, 0xc4, 0xd0,
  0x73, 0xb9, 0x31, 0xba, 0x3b, 0xc8, 0x32, 0xb6, 0x8d, 0x9d,
  0xd3, 0x00, 0x74, 0x1f, 0xa7, 0xbf, 0x8a, 0xfc, 0x47, 0xed,
  0x25, 0x76, 0xf6, 0x93, 0x6b, 0xa4, 0x24, 0x66, 0x3a, 0xab,
  0x63, 0x9c, 0x5a, 0xe4, 0xf5, 0x68, 0x34, 0x23, 0xb4, 0x74,
  0x2b, 0xf1, 0xc9, 0x78, 0x23, 0x8f, 0x16, 0xcb, 0xe3, 0x9d,
  0x65, 0x2d, 0xe3, 0xfd, 0xb8, 0xbe, 0xfc, 0x84, 0x8a, 0xd9,
  0x22, 0x22, 0x2e, 0x04, 0xa4, 0x03, 0x7c, 0x07, 0x13, 0xeb,
  0x57, 0xa8, 0x1a, 0x23, 0xf0, 0xc7, 0x34, 0x73, 0xfc, 0x64,
  0x6c, 0xea, 0x30, 0x6b, 0x4b, 0xcb, 0xc8, 0x86, 0x2f, 0x83,
  0x85, 0xdd, 0xfa, 0x9d, 0x4b, 0x7f, 0xa2, 0xc0, 0x87, 0xe8,
  0x79, 0x68, 0x33, 0x03, 0xed, 0x5b, 0xdd, 0x3a, 0x06, 0x2b,
  0x3c, 0xf5, 0xb3, 0xa2, 0x78, 0xa6, 0x6d, 0x2a, 0x13, 0xf8,
  0x3f, 0x44, 0xf8, 0x2d, 0xdf, 0x31, 0x0e, 0xe0, 0x74, 0xab,
  0x6a, 0x36, 0x45, 0x97, 0xe8, 0x99, 0xa0, 0x25, 0x5d, 0xc1,
  0x64, 0xf3, 0x1c, 0xc5, 0x08, 0x46, 0x85, 0x1d, 0xf9, 0xab,
  0x48, 0x19, 0x5d, 0xed, 0x7e, 0xa1, 0xb1, 0xd5, 0x10, 0xbd,
  0x7e, 0xe7, 0x4d, 0x73, 0xfa, 0xf3, 0x6b, 0xc3, 0x1e, 0xcf,
  0xa2, 0x68, 0x35, 0x90, 0x46, 0xf4, 0xeb, 0x87, 0x9f, 0x92,
  0x40, 0x09, 0x43, 0x8b, 0x48, 0x1c, 0x6c, 0xd7, 0x88, 0x9a,
  0x00, 0x2e, 0xd5, 0xee, 0x38, 0x2b, 0xc9, 0x19, 0x0d, 0xa6,
  0xfc, 0x02, 0x6e, 0x47, 0x95, 0x58, 0xe4, 0x47, 0x56, 0x77,
  0xe9, 0xaa, 0x9e, 0x30, 0x50, 0xe2, 0x76, 0x56, 0x94, 0xdf,
  0xc8, 0x1f, 0x56, 0xe8, 0x80, 0xb9, 0x6e, 0x71, 0x60, 0xc9,
  0x80, 0xdd, 0x98, 0xed, 0xd3, 0xdf, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff };

typedef struct {
  const char* name;
  const char* prime;
  unsigned int prime_size;
  const char* gen;
  unsigned int gen_size;
} modp_group;

static const modp_group modp_groups[] = {
#define V(var) reinterpret_cast<const char*>(var)
  { "modp1", V(group_modp1), sizeof(group_modp1), V(two_generator), 1 },
  { "modp2", V(group_modp2), sizeof(group_modp2), V(two_generator), 1 },
  { "modp5", V(group_modp5), sizeof(group_modp5), V(two_generator), 1 },
  { "modp14", V(group_modp14), sizeof(group_modp14), V(two_generator), 1 },
  { "modp15", V(group_modp15), sizeof(group_modp15), V(two_generator), 1 },
  { "modp16", V(group_modp16), sizeof(group_modp16), V(two_generator), 1 },
  { "modp17", V(group_modp17), sizeof(group_modp17), V(two_generator), 1 },
  { "modp18", V(group_modp18), sizeof(group_modp18), V(two_generator), 1 }
#undef V
};

#endif  // SRC_NODE_CRYPTO_GROUPS_H_