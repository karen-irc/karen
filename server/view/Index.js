/**
 * @license mit license
 *
 * copyright (c) 2015 tetsuharu ohzeki <saneyuki.snyk@gmail.com>
 * copyright (c) 2015 yusuke suzuki <utatane.tea@gmail.com>
 *
 * permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "software"), to deal
 * in the software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the software, and to permit persons to whom the software is
 * furnished to do so, subject to the following conditions:
 *
 * the above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the software.
 *
 * the software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. in no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising from,
 * out of or in connection with the software or the use or other dealings in
 * the software.
 */

import * as React from 'react';
import {ChatWindow} from './ChatWindow';
import {Footer} from './Footer';
import {InputForm} from './InputForm';
import {GeneralSettingWindow} from './GeneralSettingWindow';
import {Header} from './Header';
import {Layout} from './Layout';
import {Sidebar} from './Sidebar';
import {SignInWindow} from './SignInWindow';

export class KarenAppIndex extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const data = this.props.data;

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
}
KarenAppIndex.propTypes = {
    data: React.PropTypes.object.isRequired,
};
