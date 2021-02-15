import React  from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog() {
    const [open, setOpen] = React.useState(true);
  
    const handleClickGTC = () => {
        window.open('https://www.guitartabcreator.com/node/add/fretboard');
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"use Guitar Tab Creator Now"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Guitar Tab Creator now has this functionality built into it.  This means you can save
              your fretboards and reuse them!  You will need an account to do this.  All you need to do is log 
              into your account and visit <a href="https://www.guitartabcreator.com/node/add/fretboard">GTC Fretboard Tool</a>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Stay Here
            </Button>
            <Button onClick={handleClickGTC} color="primary" autoFocus>
              Go To Guitar Tab Creator
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }