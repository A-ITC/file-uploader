import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary'
import { Provider } from "../common/Context";
import GlobalStyle from '../common/Style';
import EditProject from '../uploader/EditProject';
import EditWork from '../uploader/EditWork';
import Uploader from '../uploader/Uploader';
import Signup from './Signup';

export default function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} >
            <GlobalStyle />
            <Provider>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/auth"
                            element={<Signup />} />
                        <Route
                            path="/files"
                            element={<Uploader />} />
                        <Route
                            path="/files/create"
                            element={<EditProject />} />
                        <Route
                            path="/files/:projectId/edit"
                            element={<EditProject />} />
                        <Route
                            path="/files/:projectId/works/create"
                            element={<EditWork />} />
                        <Route
                            path="/files/:projectId/works/:workId/edit"
                            element={<EditWork />} />
                        <Route
                            path="*"
                            element={<Uploader />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ErrorBoundary >
    )
}

function ErrorFallback({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: any }) {
    return (
        <div role="alert">
            <p>{error.message}</p>
            <pre style={{ fontSize: "16px" }}>{error.stack}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    )
}