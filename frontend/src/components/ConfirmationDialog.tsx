import { Button, Dialog, Typography } from '@neo4j-ndl/react';
import { CustomFile } from '../types';
import LargeFilesAlert from './LargeFilesAlert';
import { useState } from 'react';
import { useFileContext } from '../context/UsersFiles';

export default function ConfirmationDialog({
  largeFiles,
  open,
  onClose,
  loading,
  extractHandler,
}: {
  largeFiles: CustomFile[];
  open: boolean;
  onClose: () => void;
  loading: boolean;
  extractHandler: (allowLargeFiles: boolean) => void;
}) {
  const { setSelectedRows, filesData, setRowSelection } = useFileContext();
  const [checked, setChecked] = useState<string[]>([...largeFiles.map((f) => f.id)]);
  const handleToggle = (ischecked: boolean, id: string) => {
    const newChecked = [...checked];
    if (ischecked) {
      const file = filesData.find((f) => f.id === id);
      newChecked.push(id);
      setSelectedRows((prev) => [...prev, JSON.stringify(file)]);
      setRowSelection((prev) => {
        const copiedobj = { ...prev };
        for (const key in copiedobj) {
          if (JSON.parse(key).id == id) {
            copiedobj[key] = true;
          }
        }
        return copiedobj;
      });
    } else {
      const currentIndex = checked.findIndex((v) => v === id);
      console.log({ currentIndex });
      newChecked.splice(currentIndex, 1);
      setRowSelection((prev) => {
        const copiedobj = { ...prev };
        for (const key in copiedobj) {
          if (JSON.parse(key).id == id) {
            copiedobj[key] = false;
          }
        }
        return copiedobj;
      });
      setSelectedRows((prev) => {
        const filteredrows = prev.filter((f) => JSON.parse(f).id != id);
        return filteredrows;
      });
    }
    setChecked(newChecked);
  };
  return (
    <Dialog size='medium' open={open} aria-labelledby='form-dialog-title' onClose={onClose}>
      <Dialog.Content className='n-flex n-flex-col n-gap-token-4'>
        {largeFiles.length === 0 && loading ? (
          <Typography variant='body-medium'>Files are under processing</Typography>
        ) : (
          <LargeFilesAlert handleToggle={handleToggle} largeFiles={largeFiles} checked={checked}></LargeFilesAlert>
        )}
      </Dialog.Content>
      <Dialog.Actions className='mt-3'>
        <Button
          color='neutral'
          fill='outlined'
          onClick={function Ua() {
            extractHandler(false);
          }}
          size='large'
        >
          Cancel
        </Button>
        <Button disabled={loading} onClick={() => extractHandler(true)} size='large' loading={loading}>
          Continue
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
