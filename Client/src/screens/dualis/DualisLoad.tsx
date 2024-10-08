import React from 'react';

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import Heading from '../../components/textFields/Heading';
import Subheading from '../../components/textFields/Subheading';

const DualisLoad: React.FC = () => {

    return (
        <div>
            <Heading text="Dualis" />
            <Subheading text="Loading..." />
        </div>
    );
}

export default DualisLoad;