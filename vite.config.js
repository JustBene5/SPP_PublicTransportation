import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {readFileSync} from 'fs'
import path from 'path';

var cert = readFileSync('./IVU_Key.pfx')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
    }
  },
  server:{
    cors: true,
    proxy: {
       '/api' : {
         target: {
          protocol: 'https:',
          host: 'rwth.ivu.de',
          port: 443,
          pfx: cert,
          passphrase: '6zkXtGjL3wVpnc'
         },
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api/, ''),
         secure: false
       }
     }
  }
})
