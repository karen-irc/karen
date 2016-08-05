// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
import {ChatWindow} from './ChatWindow';
import {Footer} from './Footer';
import {InputForm} from './InputForm';
import {GeneralSettingWindow} from './GeneralSettingWindow';
import {Header} from './Header';
import {Layout} from './Layout';
import {Sidebar} from './Sidebar';
import {SignInWindow} from './SignInWindow';

export function KarenAppIndex({ data }) {
    return (
        <html>
            <Header theme={data.theme} />
            <body className={data.public ? 'public' : ''}>
                <Layout>
                    <Sidebar/>
                    <Footer/>
                    <div id='main'>
                        <div id='windows'>
                            <ChatWindow/>
                            <SignInWindow/>
                            <div id='js-insertion-point-connect'/>
                            <GeneralSettingWindow prefetch={data.prefetch}
                                                  version={data.version} />
                        </div>
                        <InputForm />
                    </div>
                </Layout>
            </body>
        </html>
    );
}
KarenAppIndex.propTypes = {
    data: React.PropTypes.object.isRequired,
};
