/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import QRCode from 'qrcode.react';

interface ServerInfo {
  ip: string;
  port: number;
  url: string;
}

interface FileInfo {
  path: string;
  date: Date;
  success: boolean;
  testName: string;
}

interface FileInfoDisplayProps {
  fileInfo: FileInfo;
}

const FileInfoDisplay: React.FC<FileInfoDisplayProps> = ({ fileInfo }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-br', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  formatDate(new Date());

  return (
    <button
      type="button"
      className={`list-group-item list-group-item-action ${
        fileInfo.success ? 'text-success' : 'text-danger'
      }`}
    >
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{fileInfo.testName}</h5>
      </div>
      <small>{formatDate(fileInfo.date)}</small>
    </button>
  );
};

interface ListFilesProps {
  files: FileInfo[];
}

const ListFiles: React.FC<ListFilesProps> = ({ files }) => {
  return (
    <div>
      <ul className="list-group">
        {files.map((file, index) => (
          <FileInfoDisplay key={index} fileInfo={file} />
        ))}
      </ul>
    </div>
  );
};

const Main = () => {
  const [url, setUrl] = useState('');
  const [testName, setTestName] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    ip: '',
    port: 0,
    url: '',
  });

  const getPath = (str: string) => {
    return str.trim().replace('file://', '');
  };

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:3000/upload', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        path: getPath(url),
      }),
    });
    const data = await response.json();
    setFiles([
      ...files,
      {
        path: url,
        date: new Date(),
        success: data.ok,
        testName,
      },
    ]);

    if (data.ok) {
      setUrl('');
      setTestName('');
    }
  };

  useEffect(() => {
    const getServerInfo = async () => {
      const response = await fetch('http://localhost:3000/api/server-info');
      const data = await response.json();
      setServerInfo({
        ip: data.ip,
        port: data.port,
        url: `http://${data.ip}:${data.port}/preview`,
      });
    };
    getServerInfo();
  }, []);

  return (
    <div className="p-5">
      <div className="d-flex justify-content-between mb-5">
        <h1 className="p-0 m-0">Web Server</h1>
        <button
          onClick={handleSubmit}
          className="btn btn-primary px-4"
          type="button"
        >
          Testar
        </button>
      </div>

      <div className="input-group mb-3">
        <span className="input-group-text">URL do arquivo</span>
        <input
          type="text"
          className="form-control"
          placeholder="Digite a URL do arquivo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="input-group mb-3">
        <span className="input-group-text">Nome do teste</span>
        <input
          type="text"
          className="form-control"
          placeholder="Nome do teste"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
        />
      </div>

      <div className="mt-3 row">
        <div className="col-6">
          <ListFiles files={files} />
        </div>
        <div className="col-6 text-center text-center">
          <h6 className="my-3">{serverInfo.url}</h6>
          <div className="d-flex justify-content-center">
            <QRCode value={serverInfo.url} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
