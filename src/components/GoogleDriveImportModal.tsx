import React, { useState, useEffect } from 'react';
import { 
  X, 
  Folder, 
  Music, 
  Image as ImageIcon, 
  ArrowLeft, 
  Search, 
  LogOut, 
  Loader2, 
  Check, 
  File, 
  SearchIcon,
  ChevronRight
} from 'lucide-react';
import { 
  authenticateGoogleDrive, 
  getCachedDriveToken, 
  listDriveFolder, 
  searchDriveFiles, 
  downloadDriveFile,
  isAudioMime,
  isImageMime,
  isFolderMime,
  clearDriveToken,
  DriveItem
} from '@/services/googleDriveService';
import { useAudio } from '@/context/AudioContext';

interface GoogleDriveImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  fileType: 'audio' | 'image' | 'any';
}

interface PathSegment {
  id: string;
  name: string;
}

export const GoogleDriveImportModal: React.FC<GoogleDriveImportModalProps> = ({
  isOpen,
  onClose,
  onFileSelected,
  fileType,
}) => {
  const { addNotification } = useAudio();
  const [token, setToken] = useState<string | null>(getCachedDriveToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [pathHistory, setPathHistory] = useState<PathSegment[]>([{ id: 'root', name: 'Drive' }]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  // When modal opens, auto-fetch token from cache & fetch root files if signed in
  useEffect(() => {
    if (isOpen) {
      const activeToken = getCachedDriveToken();
      setToken(activeToken);
      if (activeToken) {
        fetchFolderContents(activeToken, currentFolder);
      }
    }
  }, [isOpen, currentFolder]);

  // Handle Fetch contents
  const fetchFolderContents = async (activeToken: string, folderId: string) => {
    setLoading(true);
    setSelectedItem(null);
    try {
      const folderItems = await listDriveFolder(activeToken, folderId);
      setItems(folderItems);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('401') || err.message?.includes('invalid_grant') || err.message?.includes('token')) {
        addNotification('Google session expired. Please connect again.', 'error');
        setToken(null);
        clearDriveToken();
      } else {
        addNotification(err.message || 'Failed to list Drive files', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!searchQuery.trim()) {
      fetchFolderContents(token, currentFolder);
      return;
    }

    setLoading(true);
    setSelectedItem(null);
    try {
      const searchResults = await searchDriveFiles(token, searchQuery);
      setItems(searchResults);
    } catch (err: any) {
      addNotification(err.message || 'Search execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle connection
  const handleConnect = async () => {
    setLoading(true);
    try {
      const activeToken = await authenticateGoogleDrive();
      setToken(activeToken);
      addNotification('Successfully authorized Google Drive!', 'success');
      fetchFolderContents(activeToken, 'root');
    } catch (err: any) {
      addNotification(err.message || 'Google Drive auth failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Log Out/Disconnect Drive
  const handleDisconnect = () => {
    clearDriveToken();
    setToken(null);
    setItems([]);
    setPathHistory([{ id: 'root', name: 'Drive' }]);
    setCurrentFolder('root');
    setSelectedItem(null);
    addNotification('Disconnected Google Drive session.', 'success');
  };

  // Navigating inside a folder
  const handleItemClick = (item: DriveItem) => {
    if (isFolderMime(item.mimeType)) {
      const newPathHistory = [...pathHistory, { id: item.id, name: item.name }];
      setPathHistory(newPathHistory);
      setCurrentFolder(item.id);
      setSearchQuery('');
    } else {
      // It's a file
      const isAudio = isAudioMime(item.mimeType);
      const isImg = isImageMime(item.mimeType);

      if (fileType === 'audio' && !isAudio) {
        addNotification(`Please choose an audio file. "${item.name}" is not supported here.`, 'warning');
        return;
      }
      if (fileType === 'image' && !isImg) {
        addNotification(`Please choose an image file. "${item.name}" is not supported here.`, 'warning');
        return;
      }
      setSelectedItem(item);
    }
  };

  // Breadcrumb navigation
  const navigateToPath = (index: number) => {
    if (index === pathHistory.length - 1) return;
    const newHistory = pathHistory.slice(0, index + 1);
    setPathHistory(newHistory);
    setCurrentFolder(newHistory[index].id);
    setSearchQuery('');
  };

  // Import / Download selected file
  const handleImport = async () => {
    if (!token || !selectedItem) return;

    setDownloading(true);
    try {
      const file = await downloadDriveFile(
        token,
        selectedItem.id,
        selectedItem.name,
        selectedItem.mimeType
      );

      onFileSelected(file);
      addNotification(`Imported "${selectedItem.name}" from Google Drive!`, 'success');
      onClose();
    } catch (err: any) {
      addNotification(err.message || 'File importation failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-t-[20px] sm:rounded-[8px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 flex flex-col h-[80vh] sm:h-[70vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-900/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 512 512" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M339 314H173l-83-144h166z" fill="#FFC107"/>
              <path d="M173 314l83 144h166l-83-144z" fill="#FF5722"/>
              <path d="M173 314L90 170 8 314h165z" fill="#4CAF50"/>
              <path d="M339 314l83 144 82-144H339z" fill="#00BCD4"/>
              <path d="M256 26l83 144H173l83-144z" fill="#2196F3"/>
              <path d="M256 26l166 288h-83L173 170z" fill="#9C27B0"/>
            </svg>
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider font-display">
              Google Drive Broker
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Auth Required View */}
        {!token ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-black uppercase tracking-tight text-foreground font-display">
                Connect Google Drive Account
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed leading-normal">
                Easily browse and import your audio tracks and cover illustrations directly from your Google Drive files, with secure user authorization.
              </p>
            </div>

            {/* gsi-material-button matching skill instructions perfectly */}
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider rounded-md text-xs shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 fill-current">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              )}
              <span className="font-sans font-black">Sign in with Google</span>
            </button>
          </div>
        ) : (
          <>
            {/* Search and Disconnect Bar */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <input 
                  type="text"
                  placeholder="Query contents in Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-900 pl-8 pr-4 py-1.5 rounded-md text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSearchQuery('');
                      fetchFolderContents(token, currentFolder);
                    }}
                    className="absolute right-2.5 top-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </form>
              
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={handleDisconnect}
                  title="Disconnect Google Account"
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-red-500 rounded-md text-xs flex items-center gap-1.5 font-bold uppercase transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  disconnect
                </button>
              </div>
            </div>

            {/* Breadcrumb Bar */}
            <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900/50 flex items-center gap-1 overflow-x-auto text-[11px] font-bold text-muted-foreground whitespace-nowrap scrollbar-none">
              {pathHistory.map((seg, idx) => (
                <React.Fragment key={seg.id}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
                  <button 
                    onClick={() => navigateToPath(idx)}
                    className={`hover:text-foreground hover:underline transition-colors ${idx === pathHistory.length - 1 ? 'text-primary' : ''}`}
                  >
                    {seg.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Items Browser */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Reading cloud indexes...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <File className="h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">No matching assets found</p>
                  <p className="text-[10px] mt-1 text-muted-foreground-50 leading-relaxed max-w-xs">Empty directory or incorrect mime format filtered inside folder query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {items.map((item) => {
                    const isFolder = isFolderMime(item.mimeType);
                    const isAudio = isAudioMime(item.mimeType);
                    const isImg = isImageMime(item.mimeType);
                    const isSelected = selectedItem?.id === item.id;

                    // Support highlighting corresponding type matches
                    let disabled = false;
                    if (!isFolder) {
                      if (fileType === 'audio' && !isAudio) disabled = true;
                      if (fileType === 'image' && !isImg) disabled = true;
                    }

                    return (
                      <div 
                        key={item.id}
                        onClick={() => !disabled && handleItemClick(item)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border-primary/40 dark:bg-primary/5' 
                            : 'bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
                        } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`p-2 rounded-md ${
                          isFolder 
                            ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-500' 
                            : isAudio
                              ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-500'
                              : isImg
                                ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-500'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                        }`}>
                          {isFolder ? (
                            <Folder className="h-4 w-4" />
                          ) : isAudio ? (
                            <Music className="h-4 w-4" />
                          ) : isImg ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <File className="h-4 w-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase leading-none mt-1">
                            {isFolder ? 'Folder' : `${item.mimeType.split('/')[1] || 'Unknown'} • ${(Number(item.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 animate-in zoom-in duration-300">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900/50 flex items-center justify-between flex-shrink-0 bg-zinc-50 dark:bg-zinc-950/50">
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">
                {selectedItem ? `Selected: ${selectedItem.name}` : 'Select an asset to import'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-900 text-muted-foreground rounded-md text-xs font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedItem || downloading}
                  className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 rounded-md text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      importing...
                    </>
                  ) : (
                    <>Import Asset</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
