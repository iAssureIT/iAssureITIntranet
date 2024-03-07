
import { OrganizationChart } from 'primereact/organizationchart';
        

export default function EmployeeChart() {

    const data = [{
        label: 'F.C Barcelona',
        expanded: true,
        children: [
            {
                label: 'F.C Barcelona',
                expanded: true,
                children: [
                    {
                        label: 'Chelsea FC'
                    },
                    {
                        label: 'F.C. Barcelona'
                    }
                ]
            },
            {
                label: 'Real Madrid',
                expanded: true,
                children: [
                    {
                        label: 'Bayern Munich'
                    },
                    {
                        label: 'Real Madrid'
                    }
                ]
            }
        ]
    }];

    const nodeTemplate = (node) => {
        if (node.type === "person") {
            return (
                <div>
                    <div className="node-header">{node.label}</div>
                        <div className="node-content">
                            <img alt={node.data.avatar} src={`images/organization/${node.data.avatar}`} style={{ width: '32px' }}/>
                        <div>{node.data.name}</div>
                    </div>
                </div>
            );
        }
    
        if (node.type === "department") {
            return node.label;
        }
    }

    return (
        <OrganizationChart value={data} nodeTemplate={nodeTemplate}></OrganizationChart>
    )
}
 