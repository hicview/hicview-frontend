import * as React from 'react'
import Title from './Title';
import Paper from '@material-ui/core/Paper'

export default function Stage3DHolder() {
    return (
        <React.Fragment>
            <Paper >
                <Title> 3D Holder</Title>

                <div id='3d' style={
                    {
                        "height": "800px",
                        "width": "800px",
                        "position": "relative",
                        "margin": "0 auto"

                    }}>
                </div>

            </Paper>

        </React.Fragment>
    )
}
