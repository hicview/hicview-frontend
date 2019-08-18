import * as React from 'react'
import Title from './Title';
import Paper from '@material-ui/core/Paper'

export default function Stage2DHolder() {
    return (
        <React.Fragment>
            <Paper >
                <Title> 2D Holder</Title>

                <div id='2d' style={
                    {
                        "height": "400px",
                        "width": "800px",
                        "position": "relative",
                        "margin": "0 auto"

                    }}>
                </div>

            </Paper>

        </React.Fragment>
    )
}
