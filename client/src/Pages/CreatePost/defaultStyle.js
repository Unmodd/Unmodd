
export default {
  control: {
    backgroundColor: '#fff',
    fontSize: 16,
    fontWeight: 'normal',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px 12px',
    minHeight: '80px', 
  },

  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },

  highlighter: {
    padding: '8px 12px',
    border: '1px solid transparent',
    borderRadius: '4px',
    minHeight: '80px', 
  },

  input: {
    margin: 0,
    outline: 0,
    border: 0,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    width: '100%',
    display: 'block',
    whiteSpace: 'pre-wrap',
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
      maxHeight: '150px', 
      overflowY: 'auto',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000, 
    },
    item: {
      padding: '8px 10px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#e6f7ff',
      },
    },
  },
};