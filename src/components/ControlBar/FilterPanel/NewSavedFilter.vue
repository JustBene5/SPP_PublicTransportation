<template>
  <v-btn  color="selected" variant="elevated" icon="mdi-plus" size="x-small" id="addBtn" :disabled="disabled"/>
  <v-tooltip activator="#addBtn" location="top">Speichere aktuelle Filterung ab</v-tooltip>
  <v-menu v-model="menuActive" activator="#addBtn" location="top end" :close-on-content-click='false' >
      <v-card class="px-5" subtitle="Speichere neuen Filter" min-width="400">
        <v-form v-model="validName" lazy-validation @submit.prevent="submit"
        >
          <v-text-field 
            v-model="newFilterName" 
            @click:append="submit" 
            :autofocus="true"  
            :active="true"
            placeholder="Filtername" 
            variant="solo" 
            density="compact"  
            :rules="[rules.required, checkDuplicate]"
            autocomplete="off"
            >
            <template v-slot:append>
              <v-btn :disabled="!validName" size="small" icon="mdi-content-save" type="submit"/>
            </template>
          </v-text-field>
        </v-form>
      </v-card>
  </v-menu>
</template>

<script lang="ts">
  //This component is used to add a new filter
  
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'NewSavedFilter',
    emits: ['addFilter'],
    props: ['filterNames','disabled'],
    data () {
      return {
        menuActive: false,
        newFilterName:"",
        validName: true,
        rules: {
          required: (value:string) =>!!value || 'Bitte geben Sie einen Wert ein',
        }
      }
    },

    methods:{
      submit(){        
        this.$emit('addFilter',this.newFilterName.toLocaleUpperCase());
        this.menuActive= false;
        this.newFilterName = "";
      },
      
      checkDuplicate(value:string){
        if(this.filterNames.includes(value.toLocaleUpperCase())){
          return "Name existiert bereits";
        }
        return true;
      },
    }

  })
</script>