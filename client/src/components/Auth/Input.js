import React from 'react';
import { TextField, Grid } from '@material-ui/core';

const Input = ({ name, label, half, autoFocus, type, handleChange }) => (
  <Grid item xs={12} sm={half ? 6 : 12}>
    <TextField
      name={name}
      variant="outlined"
      required
      fullWidth
      label={label}
      autoFocus={autoFocus}
      type={type}
      onChange={handleChange}
    />
  </Grid>
);

export default Input;