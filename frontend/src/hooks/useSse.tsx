import { useFileContext } from '../context/UsersFiles';
import { eventResponsetypes } from '../types';
const perpagesecond = parseInt(process.env.TIME_PER_PAGE as string);
export default function useServerSideEvent(
  alertHandler: (inMinutes: boolean, minutes: number, filename: string) => void,
  errorHandler: (filename: string) => void
) {
  const { setFilesData } = useFileContext();
  function updateStatusForLargeFiles(eventSourceRes: eventResponsetypes) {
    const {
      fileName,
      nodeCount = 0,
      processingTime,
      relationshipCount = 0,
      status,
      total_chunks,
      model,
      processed_chunk = 0,
      total_pages = 0
    } = eventSourceRes;
    const alertShownStatus = JSON.parse(localStorage.getItem('alertShown') || 'null');

    if (status === 'Processing') {
      if (alertShownStatus != null && alertShownStatus == false && total_chunks != null) {
        const minutes = Math.floor((perpagesecond * total_pages) / 60);
        alertHandler(minutes !== 0, minutes === 0 ? Math.floor(perpagesecond * total_pages) : minutes, fileName);
      }
      if (total_chunks) {
        setFilesData((prevfiles) => {
          return prevfiles.map((curfile) => {
            if (curfile.name == fileName) {
              return {
                ...curfile,
                status: total_chunks === processed_chunk ? 'Completed' : status,
                NodesCount: nodeCount,
                relationshipCount: relationshipCount,
                model: model,
                processing: processingTime?.toFixed(2),
                processingProgress: Math.floor((processed_chunk / total_chunks) * 100),
              };
            }
            return curfile;
          });
        });
      }
    } else if (status === 'Completed' || status === 'Cancelled') {
      setFilesData((prevfiles) => {
        return prevfiles.map((curfile) => {
          if (curfile.name == fileName) {
            return {
              ...curfile,
              status: status,
              NodesCount: nodeCount,
              relationshipCount: relationshipCount,
              model: model,
              processing: processingTime?.toFixed(2),
            };
          }
          return curfile;
        });
      });
    } else if (eventSourceRes.status === 'Failed') {
      setFilesData((prevfiles) => {
        return prevfiles.map((curfile) => {
          if (curfile.name == fileName) {
            return {
              ...curfile,
              status: status,
            };
          }
          return curfile;
        });
      });
      errorHandler(fileName);
    }
  }
  return {
    updateStatusForLargeFiles,
  };
}
