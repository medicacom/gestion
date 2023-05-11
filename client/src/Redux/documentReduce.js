import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchDocument = createAsyncThunk("document/fetchDocument", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/allDocument/"+id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const getDocument = createAsyncThunk("document/getDocumentMsg", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getDocument/"+action.idUser+"/"+action.idService+"/"+action.idRole, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const allDocumentVigueur = createAsyncThunk("document/allDocumentVigueur", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/allDocumentVigueur/"+action.idRole+"/"+action.idService, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const getTextReglement = createAsyncThunk("document/getTextReglement", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getTextReglement/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const verifFeuilleUser = createAsyncThunk("document/verifFeuilleUser", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/verifFeuilleUser/"+action.id+"/"+action.idUser, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const getGant = createAsyncThunk("document/getGant", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getGant/"+action.idRole+"/"+action.idService, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const getWorkflow = createAsyncThunk("document/getWorkflow", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getWorkflow", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});
export const getWorkflowById = createAsyncThunk("document/getWorkflowById", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getWorkflowById/"+id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});
export const fetchFile = createAsyncThunk("document/file", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/file/" + file, {
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
    const document = await response;
    return document;
});
export const pdfsignature = createAsyncThunk("document/pdfsignature", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/pdfsignature/" + file, {
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
    const document = await response;
    return document;
});
export const getVisualisation = createAsyncThunk("document/getVisualisation", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getVisualisation", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const document = await response.json();
  return document;
});
export const getDocumentCreer = createAsyncThunk("document/getDocumentCreer", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getDocumentCreer", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const document = await response.json();
  return document;
});

export const documentGetById = createAsyncThunk("document/documentGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "document/getDocument", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});
export const getUserDoc = createAsyncThunk("document/getUserDoc", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getUserDoc/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});

export const documentAdded = createAsyncThunk("document/addDocument", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/addDocument", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const document = await response.status;
  return document;
});

export const addDocumentOld = createAsyncThunk("document/addDocumentOld", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/addDocumentOld", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const document = await response.json();
  return document;
});

export const identification = createAsyncThunk("document/identification", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/identification", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const document = await response.status;
  return document;
});
export const getDocApprobateur = createAsyncThunk("document/getDocApprobateur", async (type) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getDocApprobateur", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(type)
  
  });
  const document = await response.json();
  return document;
});

export const getUserDocByIdDoc = createAsyncThunk("document/getUserDocByIdDoc", async (type) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getUserDocByIdDoc/"+type, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});

export const getVersionReference = createAsyncThunk("document/getVersionReference", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getVersionReference/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },  
  });
  const document = await response.json();
  return document;
});

export const getDocFini = createAsyncThunk("document/getDocFini", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getDocFini", {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});
export const generatePdfSign = createAsyncThunk("generatePdf/generatePdfSign", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "generatePdf/generatePdfSign/"+action.idDoc+"/"+action.idApp, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});

export const getLifeCycleDoc = createAsyncThunk("document/getLifeCycleDoc", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getLifeCycleDoc", {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  
  });
  const document = await response.json();
  return document;
});

export const dashbord = createAsyncThunk("document/dashbord", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/dashbord/"+action.idDocument+"/"+action.idUser, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const document = await response.json();
  return document;
});

export const getAllDoc = createAsyncThunk("document/getAllDoc", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "document/getAllDoc", {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  
  });
  const document = await response.json();
  return document;
});
const documentReduce = createSlice({
  name: "document",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    deleteUserDoc(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "document/deleteUserDoc/"+id, {
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

    [fetchDocument.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchDocument.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchDocument.rejected]: (state, action) => {
      state.loading = false;
    },
    [documentGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [documentGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [documentGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { deleteUserDoc } = documentReduce.actions;
export default documentReduce.reducer;
