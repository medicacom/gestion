import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchVigueur = createAsyncThunk("vigueur/fetchVigueur", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "vigueur/allVigueur", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const vigueur = await response.json();
  return vigueur;
});

export const vigueurGetById = createAsyncThunk("vigueur/vigueurGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "vigueur/getVigueur", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const vigueur = await response.json();
  return vigueur;
});
export const allVigueurRole = createAsyncThunk("vigueur/allVigueurRole", async (role) => {
  const response = await fetch(Configuration.BACK_BASEURL + "vigueur/allVigueurRole/"+role, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const vigueur = await response.json();
  return vigueur;
});
export const getFileText = createAsyncThunk("vigueur/getFile", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "vigueur/getFile/"+file, {
    method: "GET",
    responseType: "blob",
    //Force to receive data in a Blob Format
  })
  .then((response) => {
    return response.url;
  })
  .catch((error) => {
    console.log(error);
  })
  const files = await response;
  return files;
});
const vigueurReduce = createSlice({
  name: "vigueur",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    vigueurAdded(state, action) {
      fetch(Configuration.BACK_BASEURL + "vigueur/addVigueur", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    vigueurFile(state, action) {
      fetch(Configuration.BACK_BASEURL + "vigueur/saveFile", {
        method: 'POST',
        headers: {'Accept': 'application/*',
        },
        body:action.payload.fileArray
      });
    },
    vigueurUpdated(state, action) {
      fetch(Configuration.BACK_BASEURL + "vigueur/addVigueur", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    vigueurDeleted(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "vigueur/deleteVigueur/"+id, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
      });
    },

  },
  extraReducers: {

    [fetchVigueur.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchVigueur.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchVigueur.rejected]: (state, action) => {
      state.loading = false;
    },
    [vigueurGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [vigueurGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [vigueurGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { vigueurAdded, vigueurUpdated,vigueurFile,vigueurDeleted } = vigueurReduce.actions;

export default vigueurReduce.reducer;
