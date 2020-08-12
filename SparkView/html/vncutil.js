/*
Copyright � 2000 by Jef Poskanzer <jef@mail.acme.com>.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.

Port to JavaScript by Yongtao Wang @ www.remotespark.com

 */

function DesCipher(key) {
    var bytebit = [ 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80 ];
    var bigbyte = [ 0x800000, 0x400000, 0x200000, 0x100000, 0x080000, 0x040000,
            0x020000, 0x010000, 0x008000, 0x004000, 0x002000, 0x001000,
            0x000800, 0x000400, 0x000200, 0x000100, 0x000080, 0x000040,
            0x000020, 0x000010, 0x000008, 0x000004, 0x000002, 0x000001 ];
    var pc1 = [ 56, 48, 40, 32, 24, 16, 8, 0, 57, 49, 41, 33, 25, 17, 9, 1, 58,
            50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 62, 54, 46, 38, 30, 22,
            14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 60, 52, 44, 36, 28, 20, 12,
            4, 27, 19, 11, 3 ];
    var totrot = [ 1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28 ];

    var pc2 = [ 13, 16, 10, 23, 0, 4, 2, 27, 14, 5, 20, 9, 22, 18, 11, 3, 25,
            7, 15, 6, 26, 19, 12, 1, 40, 51, 30, 36, 46, 54, 29, 39, 50, 44,
            32, 47, 43, 48, 38, 55, 33, 52, 45, 41, 49, 35, 28, 31 ];

    var SP1 = [ 0x01010400, 0x00000000, 0x00010000, 0x01010404, 0x01010004,
            0x00010404, 0x00000004, 0x00010000, 0x00000400, 0x01010400,
            0x01010404, 0x00000400, 0x01000404, 0x01010004, 0x01000000,
            0x00000004, 0x00000404, 0x01000400, 0x01000400, 0x00010400,
            0x00010400, 0x01010000, 0x01010000, 0x01000404, 0x00010004,
            0x01000004, 0x01000004, 0x00010004, 0x00000000, 0x00000404,
            0x00010404, 0x01000000, 0x00010000, 0x01010404, 0x00000004,
            0x01010000, 0x01010400, 0x01000000, 0x01000000, 0x00000400,
            0x01010004, 0x00010000, 0x00010400, 0x01000004, 0x00000400,
            0x00000004, 0x01000404, 0x00010404, 0x01010404, 0x00010004,
            0x01010000, 0x01000404, 0x01000004, 0x00000404, 0x00010404,
            0x01010400, 0x00000404, 0x01000400, 0x01000400, 0x00000000,
            0x00010004, 0x00010400, 0x00000000, 0x01010004 ];
    var SP2 = [ 0x80108020, 0x80008000, 0x00008000, 0x00108020, 0x00100000,
            0x00000020, 0x80100020, 0x80008020, 0x80000020, 0x80108020,
            0x80108000, 0x80000000, 0x80008000, 0x00100000, 0x00000020,
            0x80100020, 0x00108000, 0x00100020, 0x80008020, 0x00000000,
            0x80000000, 0x00008000, 0x00108020, 0x80100000, 0x00100020,
            0x80000020, 0x00000000, 0x00108000, 0x00008020, 0x80108000,
            0x80100000, 0x00008020, 0x00000000, 0x00108020, 0x80100020,
            0x00100000, 0x80008020, 0x80100000, 0x80108000, 0x00008000,
            0x80100000, 0x80008000, 0x00000020, 0x80108020, 0x00108020,
            0x00000020, 0x00008000, 0x80000000, 0x00008020, 0x80108000,
            0x00100000, 0x80000020, 0x00100020, 0x80008020, 0x80000020,
            0x00100020, 0x00108000, 0x00000000, 0x80008000, 0x00008020,
            0x80000000, 0x80100020, 0x80108020, 0x00108000 ];
    var SP3 = [ 0x00000208, 0x08020200, 0x00000000, 0x08020008, 0x08000200,
            0x00000000, 0x00020208, 0x08000200, 0x00020008, 0x08000008,
            0x08000008, 0x00020000, 0x08020208, 0x00020008, 0x08020000,
            0x00000208, 0x08000000, 0x00000008, 0x08020200, 0x00000200,
            0x00020200, 0x08020000, 0x08020008, 0x00020208, 0x08000208,
            0x00020200, 0x00020000, 0x08000208, 0x00000008, 0x08020208,
            0x00000200, 0x08000000, 0x08020200, 0x08000000, 0x00020008,
            0x00000208, 0x00020000, 0x08020200, 0x08000200, 0x00000000,
            0x00000200, 0x00020008, 0x08020208, 0x08000200, 0x08000008,
            0x00000200, 0x00000000, 0x08020008, 0x08000208, 0x00020000,
            0x08000000, 0x08020208, 0x00000008, 0x00020208, 0x00020200,
            0x08000008, 0x08020000, 0x08000208, 0x00000208, 0x08020000,
            0x00020208, 0x00000008, 0x08020008, 0x00020200 ];
    var SP4 = [ 0x00802001, 0x00002081, 0x00002081, 0x00000080, 0x00802080,
            0x00800081, 0x00800001, 0x00002001, 0x00000000, 0x00802000,
            0x00802000, 0x00802081, 0x00000081, 0x00000000, 0x00800080,
            0x00800001, 0x00000001, 0x00002000, 0x00800000, 0x00802001,
            0x00000080, 0x00800000, 0x00002001, 0x00002080, 0x00800081,
            0x00000001, 0x00002080, 0x00800080, 0x00002000, 0x00802080,
            0x00802081, 0x00000081, 0x00800080, 0x00800001, 0x00802000,
            0x00802081, 0x00000081, 0x00000000, 0x00000000, 0x00802000,
            0x00002080, 0x00800080, 0x00800081, 0x00000001, 0x00802001,
            0x00002081, 0x00002081, 0x00000080, 0x00802081, 0x00000081,
            0x00000001, 0x00002000, 0x00800001, 0x00002001, 0x00802080,
            0x00800081, 0x00002001, 0x00002080, 0x00800000, 0x00802001,
            0x00000080, 0x00800000, 0x00002000, 0x00802080 ];
    var SP5 = [ 0x00000100, 0x02080100, 0x02080000, 0x42000100, 0x00080000,
            0x00000100, 0x40000000, 0x02080000, 0x40080100, 0x00080000,
            0x02000100, 0x40080100, 0x42000100, 0x42080000, 0x00080100,
            0x40000000, 0x02000000, 0x40080000, 0x40080000, 0x00000000,
            0x40000100, 0x42080100, 0x42080100, 0x02000100, 0x42080000,
            0x40000100, 0x00000000, 0x42000000, 0x02080100, 0x02000000,
            0x42000000, 0x00080100, 0x00080000, 0x42000100, 0x00000100,
            0x02000000, 0x40000000, 0x02080000, 0x42000100, 0x40080100,
            0x02000100, 0x40000000, 0x42080000, 0x02080100, 0x40080100,
            0x00000100, 0x02000000, 0x42080000, 0x42080100, 0x00080100,
            0x42000000, 0x42080100, 0x02080000, 0x00000000, 0x40080000,
            0x42000000, 0x00080100, 0x02000100, 0x40000100, 0x00080000,
            0x00000000, 0x40080000, 0x02080100, 0x40000100 ];
    var SP6 = [ 0x20000010, 0x20400000, 0x00004000, 0x20404010, 0x20400000,
            0x00000010, 0x20404010, 0x00400000, 0x20004000, 0x00404010,
            0x00400000, 0x20000010, 0x00400010, 0x20004000, 0x20000000,
            0x00004010, 0x00000000, 0x00400010, 0x20004010, 0x00004000,
            0x00404000, 0x20004010, 0x00000010, 0x20400010, 0x20400010,
            0x00000000, 0x00404010, 0x20404000, 0x00004010, 0x00404000,
            0x20404000, 0x20000000, 0x20004000, 0x00000010, 0x20400010,
            0x00404000, 0x20404010, 0x00400000, 0x00004010, 0x20000010,
            0x00400000, 0x20004000, 0x20000000, 0x00004010, 0x20000010,
            0x20404010, 0x00404000, 0x20400000, 0x00404010, 0x20404000,
            0x00000000, 0x20400010, 0x00000010, 0x00004000, 0x20400000,
            0x00404010, 0x00004000, 0x00400010, 0x20004010, 0x00000000,
            0x20404000, 0x20000000, 0x00400010, 0x20004010 ];
    var SP7 = [ 0x00200000, 0x04200002, 0x04000802, 0x00000000, 0x00000800,
            0x04000802, 0x00200802, 0x04200800, 0x04200802, 0x00200000,
            0x00000000, 0x04000002, 0x00000002, 0x04000000, 0x04200002,
            0x00000802, 0x04000800, 0x00200802, 0x00200002, 0x04000800,
            0x04000002, 0x04200000, 0x04200800, 0x00200002, 0x04200000,
            0x00000800, 0x00000802, 0x04200802, 0x00200800, 0x00000002,
            0x04000000, 0x00200800, 0x04000000, 0x00200800, 0x00200000,
            0x04000802, 0x04000802, 0x04200002, 0x04200002, 0x00000002,
            0x00200002, 0x04000000, 0x04000800, 0x00200000, 0x04200800,
            0x00000802, 0x00200802, 0x04200800, 0x00000802, 0x04000002,
            0x04200802, 0x04200000, 0x00200800, 0x00000000, 0x00000002,
            0x04200802, 0x00000000, 0x00200802, 0x04200000, 0x00000800,
            0x04000002, 0x04000800, 0x00000800, 0x00200002 ];
    var SP8 = [ 0x10001040, 0x00001000, 0x00040000, 0x10041040, 0x10000000,
            0x10001040, 0x00000040, 0x10000000, 0x00040040, 0x10040000,
            0x10041040, 0x00041000, 0x10041000, 0x00041040, 0x00001000,
            0x00000040, 0x10040000, 0x10000040, 0x10001000, 0x00001040,
            0x00041000, 0x00040040, 0x10040040, 0x10041000, 0x00001040,
            0x00000000, 0x00000000, 0x10040040, 0x10000040, 0x10001000,
            0x00041040, 0x00040000, 0x00041040, 0x00040000, 0x10041000,
            0x00001000, 0x00000040, 0x10040040, 0x00001000, 0x00041040,
            0x10001000, 0x00000040, 0x10000040, 0x10040000, 0x10040040,
            0x10000000, 0x00040000, 0x10001040, 0x00000000, 0x10041040,
            0x00040040, 0x10000040, 0x10040000, 0x10001000, 0x10001040,
            0x00000000, 0x10041040, 0x00041000, 0x00041000, 0x00001040,
            0x00001040, 0x00040040, 0x10000000, 0x10041000 ];

    var encryptKeys = new Array(32);// int
    encryptKeys[0] = 0;
    var decryptKeys = new Array(32);// int
    decryptKeys[0] = 0;

    // Set the key.
    this.setKey = function(key) {
        deskey(key, true, encryptKeys);
        deskey(key, false, decryptKeys);
    };

    this.setKey(key);

    // Turn an 8-byte key into internal keys.
    function deskey(keyBlock, encrypting, KnL) {
        var i = 0, j = 0, l = 0, m = 0, n = 0;
        var pc1m = new Array(56);// int
        var pcr = new Array(56);
        var kn = new Array(32);

        for (j = 0; j < 56; ++j) {
            l = pc1[j];
            m = l & 7;
            pc1m[j] = ((keyBlock[l >>> 3] & bytebit[m]) != 0) ? 1 : 0;
        }

        for (i = 0; i < 16; ++i) {
            if (encrypting)
                m = i << 1;
            else
                m = (15 - i) << 1;
            n = m + 1;
            kn[m] = kn[n] = 0;
            for (j = 0; j < 28; ++j) {
                l = j + totrot[i];
                if (l < 28)
                    pcr[j] = pc1m[l];
                else
                    pcr[j] = pc1m[l - 28];
            }
            for (j = 28; j < 56; ++j) {
                l = j + totrot[i];
                if (l < 56)
                    pcr[j] = pc1m[l];
                else
                    pcr[j] = pc1m[l - 28];
            }
            for (j = 0; j < 24; ++j) {
                if (pcr[pc2[j]] != 0)
                    kn[m] |= bigbyte[j];
                if (pcr[pc2[j + 24]] != 0)
                    kn[n] |= bigbyte[j];
            }
        }
        cookey(kn, KnL);
    }

    function cookey(raw, KnL) {
        var raw0 = 0, raw1 = 0;
        var rawi = 0, KnLi = 0;
        var i = 0;

        for (i = 0, rawi = 0, KnLi = 0; i < 16; ++i) {
            raw0 = raw[rawi++];
            raw1 = raw[rawi++];
            KnL[KnLi] = (raw0 & 0x00fc0000) << 6;
            KnL[KnLi] |= (raw0 & 0x00000fc0) << 10;
            KnL[KnLi] |= (raw1 & 0x00fc0000) >>> 10;
            KnL[KnLi] |= (raw1 & 0x00000fc0) >>> 6;
            ++KnLi;
            KnL[KnLi] = (raw0 & 0x0003f000) << 12;
            KnL[KnLi] |= (raw0 & 0x0000003f) << 16;
            KnL[KnLi] |= (raw1 & 0x0003f000) >>> 4;
            KnL[KnLi] |= (raw1 & 0x0000003f);
            ++KnLi;
        }
    }

    // Block encryption routines.

    var tempInts = [ 0, 0 ];

    // / Encrypt a block of eight bytes.
    this.encrypt = function(clearText, clearOff, cipherText, cipherOff) {
        squashBytesToInts(clearText, clearOff, tempInts, 0, 2);
        des(tempInts, tempInts, encryptKeys);
        spreadIntsToBytes(tempInts, 0, cipherText, cipherOff, 2);
    };

    // / Decrypt a block of eight bytes.
    this.decrypt = function(cipherText, cipherOff, clearText, clearOff) {
        squashBytesToInts(cipherText, cipherOff, tempInts, 0, 2);
        des(tempInts, tempInts, decryptKeys);
        spreadIntsToBytes(tempInts, 0, clearText, clearOff, 2);
    };

    // The DES function.
    function des(inInts, outInts, keys) {
        var fval = 0, work = 0, right = 0, leftt = 0;
        var round = 0;
        var keysi = 0;

        leftt = inInts[0];
        right = inInts[1];

        work = ((leftt >>> 4) ^ right) & 0x0f0f0f0f;
        right ^= work;
        leftt ^= (work << 4);

        work = ((leftt >>> 16) ^ right) & 0x0000ffff;
        right ^= work;
        leftt ^= (work << 16);

        work = ((right >>> 2) ^ leftt) & 0x33333333;
        leftt ^= work;
        right ^= (work << 2);

        work = ((right >>> 8) ^ leftt) & 0x00ff00ff;
        leftt ^= work;
        right ^= (work << 8);
        right = (right << 1) | ((right >>> 31) & 1);

        work = (leftt ^ right) & 0xaaaaaaaa;
        leftt ^= work;
        right ^= work;
        leftt = (leftt << 1) | ((leftt >>> 31) & 1);

        for (round = 0; round < 8; ++round) {
            work = (right << 28) | (right >>> 4);
            work ^= keys[keysi++];
            fval = SP7[work & 0x0000003f];
            fval |= SP5[(work >>> 8) & 0x0000003f];
            fval |= SP3[(work >>> 16) & 0x0000003f];
            fval |= SP1[(work >>> 24) & 0x0000003f];
            work = right ^ keys[keysi++];
            fval |= SP8[work & 0x0000003f];
            fval |= SP6[(work >>> 8) & 0x0000003f];
            fval |= SP4[(work >>> 16) & 0x0000003f];
            fval |= SP2[(work >>> 24) & 0x0000003f];
            leftt ^= fval;
            work = (leftt << 28) | (leftt >>> 4);
            work ^= keys[keysi++];
            fval = SP7[work & 0x0000003f];
            fval |= SP5[(work >>> 8) & 0x0000003f];
            fval |= SP3[(work >>> 16) & 0x0000003f];
            fval |= SP1[(work >>> 24) & 0x0000003f];
            work = leftt ^ keys[keysi++];
            fval |= SP8[work & 0x0000003f];
            fval |= SP6[(work >>> 8) & 0x0000003f];
            fval |= SP4[(work >>> 16) & 0x0000003f];
            fval |= SP2[(work >>> 24) & 0x0000003f];
            right ^= fval;
        }

        right = (right << 31) | (right >>> 1);
        work = (leftt ^ right) & 0xaaaaaaaa;
        leftt ^= work;
        right ^= work;
        leftt = (leftt << 31) | (leftt >>> 1);
        work = ((leftt >>> 8) ^ right) & 0x00ff00ff;
        right ^= work;
        leftt ^= (work << 8);
        work = ((leftt >>> 2) ^ right) & 0x33333333;
        right ^= work;
        leftt ^= (work << 2);
        work = ((right >>> 16) ^ leftt) & 0x0000ffff;
        leftt ^= work;
        right ^= (work << 16);
        work = ((right >>> 4) ^ leftt) & 0x0f0f0f0f;
        leftt ^= work;
        right ^= (work << 4);
        outInts[0] = right;
        outInts[1] = leftt;
    }

    // Routines taken from other parts of the Acme utilities.

    // / Squash bytes down to ints.
    function squashBytesToInts(inBytes, inOff, outInts, outOff, intLen) {
        for ( var i = 0; i < intLen; ++i)
            outInts[outOff + i] = ((inBytes[inOff + i * 4] & 0xff) << 24)
                    | ((inBytes[inOff + i * 4 + 1] & 0xff) << 16)
                    | ((inBytes[inOff + i * 4 + 2] & 0xff) << 8)
                    | (inBytes[inOff + i * 4 + 3] & 0xff);
    }

    // / Spread ints into bytes.
    function spreadIntsToBytes(inInts, inOff, outBytes, outOff, intLen) {
        for ( var i = 0; i < intLen; ++i) {
            outBytes[outOff + i * 4] = (inInts[inOff + i] >>> 24) & 0xFF;
            outBytes[outOff + i * 4 + 1] = (inInts[inOff + i] >>> 16) & 0xFF;
            outBytes[outOff + i * 4 + 2] = (inInts[inOff + i] >>> 8) & 0xFF;
            outBytes[outOff + i * 4 + 3] = inInts[inOff + i] & 0xFF;
        }
    }
}

/*
 * tinflate - tiny inflate
 * 
 * Copyright (c) 2003 by Joergen Ibsen / Jibz All Rights Reserved
 * 
 * http://www.ibsensoftware.com/
 * 
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the authors be held liable for any damages arising from the
 * use of this software.
 * 
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 
 * 1. The origin of this software must not be misrepresented; you must not claim
 * that you wrote the original software. If you use this software in a product,
 * an acknowledgment in the product documentation would be appreciated but is
 * not required.
 * 
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 
 * 3. This notice may not be removed or altered from any source distribution.
 */

/*
 * tinflate javascript port by Erik Moller in May 2011. emoller@opera.com
 * 
 * read_bits() patched by mike@imidio.com to allow reading more then 8 bits
 * (needed in some zlib streams)
 * 
 * Modified by Yongtao Wang @ www.remotespark.com in Oct, 2013, changes including:
 * avoid creating new object and gabage collection, can set up history etc.
 */

function TINF() {

    this.OK = 0;
    this.DATA_ERROR = (-3);
//    this.WINDOW_SIZE = 32768;
    
    var _tinf = this;

    /***************************************************************************
     * ------------------------------ -- internal data structures -- *
     * ------------------------------
     */

    function TREE() {
        this.table = new Array(16); /* table of code length counts */
        this.table[0] = 0;
        this.trans = new Array(288); /* code -> symbol translation table */
        this.trans[0] = 0;
    };

    function DATA() {
        this.source = '';
        this.sourceIndex = 0;
        this.tag = 0;
        this.bitcount = 0;

        this.dest = new Array(4096);
        this.dest[0] = 0;
        this.destIndex = 0;

        this.history = [0];
        this.history.length = 0;

        this.ltree = new TREE(); /* dynamic length/symbol tree */
        this.dtree = new TREE(); /* dynamic distance tree */
        this.status = 0;
    };

    /***************************************************************************
     * --------------------------------------------------- -- uninitialized
     * global data (static structures) -- *
     * ---------------------------------------------------
     */

    var sltree = new TREE(); /* fixed length/symbol tree */
    var sdtree = new TREE(); /* fixed distance tree */

    /* extra bits and base tables for length codes */
    var length_bits = new Array(30);
    var length_base = new Array(30);

    /* extra bits and base tables for distance codes */
    var dist_bits = new Array(30);
    var dist_base = new Array(30);

    /* special ordering of code length codes */
    var clcidx = [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14,
            1, 15 ];

    /***************************************************************************
     * ----------------------- -- utility functions -- * -----------------------
     */

    /* build extra bits and base tables */
    function build_bits_base(bits, base, delta, first) {
        var i, sum;

        /* build bits table */
        for (i = 0; i < delta; ++i)
            bits[i] = 0;
        for (i = 0; i < 30 - delta; ++i)
            bits[i + delta] = Math.floor(i / delta);

        /* build base table */
        for (sum = first, i = 0; i < 30; ++i) {
            base[i] = sum;
            sum += 1 << bits[i];
        }
    };

    /* build the fixed huffman trees */
    function build_fixed_trees(lt, dt) {
        var i;

        /* build fixed length tree */
        for (i = 0; i < 7; ++i)
            lt.table[i] = 0;

        lt.table[7] = 24;
        lt.table[8] = 152;
        lt.table[9] = 112;

        for (i = 0; i < 24; ++i)
            lt.trans[i] = 256 + i;
        for (i = 0; i < 144; ++i)
            lt.trans[24 + i] = i;
        for (i = 0; i < 8; ++i)
            lt.trans[24 + 144 + i] = 280 + i;
        for (i = 0; i < 112; ++i)
            lt.trans[24 + 144 + 8 + i] = 144 + i;

        /* build fixed distance tree */
        for (i = 0; i < 5; ++i)
            dt.table[i] = 0;

        dt.table[5] = 32;

        for (i = 0; i < 32; ++i)
            dt.trans[i] = i;
    };
    
    var __offs = new Array(16);

    /* given an array of code lengths, build a tree */
    function build_tree(t, lengths, loffset, num) {
        var offs = __offs;
        var i, sum;

        /* clear code length count table */
        for (i = 0; i < 16; ++i)
            t.table[i] = 0;

        /* scan symbol lengths, and sum code length counts */
        for (i = 0; i < num; ++i)
            t.table[lengths[loffset + i]]++;

        t.table[0] = 0;

        /* compute offset table for distribution sort */
        for (sum = 0, i = 0; i < 16; ++i) {
            offs[i] = sum;
            sum += t.table[i];
        }

        /* create code->symbol translation table (symbols sorted by code) */
        for (i = 0; i < num; ++i) {
            if (lengths[loffset + i])
                t.trans[offs[lengths[loffset + i]]++] = i;
        }
    };

    /***************************************************************************
     * ---------------------- -- decode functions -- * ----------------------
     */

    /* get one bit from source stream */
    function _getbit(d) {
        var bit;

        /* check if tag is empty */
        if (!d.bitcount--) {
            /* load next tag */
            d.tag = d.source[d.sourceIndex++] & 0xff;
            d.bitcount = 7;
        }

        /* shift bit out of tag */
        bit = d.tag & 0x01;
        d.tag >>= 1;

        return bit;
    };

    function _read_bits(d, num, base) {
        if (!num)
            return base;

        var val = 0;
        while (d.bitcount < 24) {
            d.tag = d.tag | (d.source[d.sourceIndex++]) << d.bitcount;
            d.bitcount += 8;
        }
        val = d.tag & (0xffff >> (16 - num));
        d.tag >>= num;
        d.bitcount -= num;
        
        return val + base;
    };

    /* given a data stream and a tree, decode a symbol */
    function _decode_symbol(d, t) {
        while (d.bitcount < 16) {
            d.tag = d.tag | (d.source[d.sourceIndex++]) << d.bitcount;
            d.bitcount += 8;
        }

        var sum = 0, cur = 0, len = 0;
        do {
            cur = 2 * cur + ((d.tag & (1 << len)) >> len);

            ++len;

            sum += t.table[len];
            cur -= t.table[len];

        } while (cur >= 0);

        d.tag >>= len;
        d.bitcount -= len;

        return t.trans[sum + cur];
    };

    var __code_tree = new TREE();
    var __lengths = new Array(288 + 32);
    /* given a data stream, decode dynamic trees from it */
    function decode_trees(d, lt, dt) {
        var code_tree = __code_tree;
        var lengths = __lengths;
        var hlit, hdist, hclen;
        var i, num, length;
        var read_bits = _read_bits;
        var decode_symbol = _decode_symbol;

        /* get 5 bits HLIT (257-286) */
        hlit = read_bits(d, 5, 257);

        /* get 5 bits HDIST (1-32) */
        hdist = read_bits(d, 5, 1);

        /* get 4 bits HCLEN (4-19) */
        hclen = read_bits(d, 4, 4);

        for (i = 0; i < 19; ++i)
            lengths[i] = 0;

        /* read code lengths for code length alphabet */
        for (i = 0; i < hclen; ++i) {
            /* get 3 bits code length (0-7) */
            var clen = read_bits(d, 3, 0);

            lengths[clcidx[i]] = clen;
        }

        /* build code length tree */
        build_tree(code_tree, lengths, 0, 19);

        /* decode code lengths for the dynamic trees */
        for (num = 0; num < hlit + hdist;) {
            var sym = decode_symbol(d, code_tree);

            switch (sym) {
            case 16:
                /* copy previous code length 3-6 times (read 2 bits) */
            {
                var prev = lengths[num - 1];
                for (length = read_bits(d, 2, 3); length; --length) {
                    lengths[num++] = prev;
                }
            }
                break;
            case 17:
                /* repeat code length 0 for 3-10 times (read 3 bits) */
                for (length = read_bits(d, 3, 3); length; --length) {
                    lengths[num++] = 0;
                }
                break;
            case 18:
                /* repeat code length 0 for 11-138 times (read 7 bits) */
                for (length = read_bits(d, 7, 11); length; --length) {
                    lengths[num++] = 0;
                }
                break;
            default:
                /* values 0-15 represent the actual code lengths */
                lengths[num++] = sym;
                break;
            }
        }

        /* build dynamic trees */
        build_tree(lt, lengths, 0, hlit);
        build_tree(dt, lengths, hlit, hdist);
    };

    /***************************************************************************
     * ----------------------------- -- block inflate functions -- *
     * -----------------------------
     */

    /* given a stream and two trees, inflate a block of data */
    function inflate_block_data(d, lt, dt) {
        // js optimization.
        var ddest = d.dest;
        var ddestlength = d.destIndex;
        var read_bits = _read_bits;
        var history = d.history;
        var decode_symbol = _decode_symbol;
        
        while (true) {
            var sym = decode_symbol(d, lt);

            /* check for end of block */
            if (sym == 256) {
//                return _tinf.OK;
                break;
            }

            if (sym < 256) {
                ddest[ddestlength++] = sym; // ? String.fromCharCode(sym);
                history.push(sym);
            } else {

                var length, dist, offs;
                var i;

                sym -= 257;

                /* possibly get more bits from length code */
                length = read_bits(d, length_bits[sym],
                        length_base[sym]);

                dist = decode_symbol(d, dt);

                /* possibly get more bits from distance code */
                offs = history.length
                        - read_bits(d, dist_bits[dist],
                                dist_base[dist]);

//                if (offs < 0)
//                    throw ("Invalid zlib offset " + offs);

                /* copy match */
                for (i = offs; i < offs + length; ++i) {
                    // ddest[ddestlength++] = ddest[i];
                    ddest[ddestlength++] = history[i];
                    history.push(d.history[i]);
                }
            }
        }
        
        d.destIndex = ddestlength;
        return _tinf.OK;
    };

    /* inflate an uncompressed block of data */
    function inflate_uncompressed_block(d) {
        var length, invlength;
        var i = 0, source = d.source, history = d.history, dest = d.dest, destIndex = d.destIndex;

        if (d.bitcount > 7) {
            var overflow = Math.floor(d.bitcount / 8);
            d.sourceIndex -= overflow;
            d.bitcount = 0;
            d.tag = 0;
        }

        /* get length */
        length = source[d.sourceIndex + 1];
        length = 256 * length + source[d.sourceIndex];

        /* get one's complement of length */
        invlength = source[d.sourceIndex + 3];
        invlength = 256 * invlength + source[d.sourceIndex + 2];

        /* check length */
        if (length != (~invlength & 0x0000ffff))
            return _tinf.DATA_ERROR;

        d.sourceIndex += 4;

        /* copy block */
        for (i = length; i; --i) {
            history.push(source[d.sourceIndex]);
            dest[destIndex++] = source[d.sourceIndex++];
        }

        /* make sure we start next block on a byte boundary */
        d.bitcount = 0;
        d.destIndex = destIndex;

        return _tinf.OK;
    };

    /***************************************************************************
     * ---------------------- -- public functions -- * ----------------------
     */

    var __data = new DATA();
    var header = 0;

    this.reset = function() {
        __data = new DATA();
        header = 0;
    };
    
    this.release = function(){
    	__data = null;
    	_tinf = null;
    };
    

    /* initialize global (static) data */
    this.init = function(h) {
        /* build fixed huffman trees */
        build_fixed_trees(sltree, sdtree);

        /* build extra bits and base tables */
        build_bits_base(length_bits, length_base, 4, 3);
        build_bits_base(dist_bits, dist_base, 2, 1);

        /* fix a special case */
        length_bits[28] = 0;
        length_base[28] = 258;

        this.reset();
        if (h){
            header = h;
        }
    };
    
    this.getHistory = function(){
        return __data.history;
    };
    
    this.setHistory = function(h){
        __data.history = h;
    };
    

    /* inflate stream from source to dest */
    this.uncompress = function(source, offset) {

        var d = __data;
        var bfinal;
        var read_bits = _read_bits;

        /* initialise data */
        d.source = source;
        d.sourceIndex = offset;
        d.bitcount = 0;

//        d.dest = [];
        d.destIndex = 0;

        // Skip zlib header at start of stream
        if (!header) {
            header = read_bits(d, 16, 0);
            /* byte 0: 0x78, 7 = 32k window size, 8 = deflate */
            /* byte 1: check bits for header and other flags */
        }

        var blocks = 0;
        var getbit = _getbit;

        do {

            var btype;
            var res;

            /* read final block flag */
            bfinal = getbit(d);

            /* read block type (2 bits) */
            btype = read_bits(d, 2, 0);

            /* decompress block */
            switch (btype) {
            case 0:
                /* decompress uncompressed block */
                res = inflate_uncompressed_block(d);
                break;
            case 1:
                /* decompress block with fixed huffman trees */
                res = inflate_block_data(d, sltree, sdtree);//inflate_fixed_block(d);
                break;
            case 2:
                /* decompress block with dynamic huffman trees */
//                res = inflate_dynamic_block(d);
                /* decode trees from stream */
                decode_trees(d, d.ltree, d.dtree);

                /* decode block using decoded trees */
                res = inflate_block_data(d, d.ltree, d.dtree);

                break;
            default:
                d.status = _tinf.DATA_ERROR;
                return d;
            }

            if (res != _tinf.OK){
                d.status = _tinf.DATA_ERROR;
                return d;
            }
            blocks++;

        } while (!bfinal && d.sourceIndex < d.source.length);

        d.history = d.history.slice(-32768);
        d.status = _tinf.OK;
        return d;
    };

};
