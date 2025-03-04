function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function fetchPanels() {
    fetch('/api/panels/')
        .then(response => response.json())
        .then(data => {
            let panelList = document.getElementById('panel-list');
            panelList.innerHTML = '';
            data.forEach(panel => {
                console.log(panel);
                panelList.innerHTML += `
                    <div>
                        ${panel.brand} - PKR ${panel.price} Per W - ${panel.power}W - Default: ${panel.default_choice ? 'Yes' : 'No'}
                        <button onclick="setDefaultPanel(${panel.id})">Set Default</button>
                        <button onclick="showEditPanelForm(${panel.id}, '${panel.brand}', ${panel.price}, ${panel.power})">Edit</button>
                        <button onclick="deletePanel(${panel.id})">Delete</button>
                    </div>
                `;
            });
        });
}


function setDefaultPanel(panelId) {
    fetch(`/api/set-default-panel/${panelId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken  // Ensure CSRF protection
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Default panel set successfully!');
            fetchPanels();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function fetchInverters() {
    fetch('/api/inverters/')
        .then(response => response.json())
        .then(data => {
            let inverterList = document.getElementById('inverter-list');
            inverterList.innerHTML = '';
            data.forEach(inverter => {
                inverterList.innerHTML += `
                    <div>
                        ${inverter.brand} - PKR ${inverter.price} - ${inverter.power}W
                        <button onclick="showEditInverterForm(${inverter.id}, '${inverter.brand}', ${inverter.price}, ${inverter.power})">Edit</button>
                        <button onclick="deleteInverter(${inverter.id})">Delete</button>
                    </div>
                `;
            });
        });
}

function fetchCustomers() {
    fetch('/api/customers/')
        .then(response => response.json())
        .then(data => {
            let customerList = document.getElementById('customer-list');
            customerList.innerHTML = '';
            data.forEach(customer => {
                customerList.innerHTML += `<div>${customer.name} - ${customer.phone} - ${customer.address}</div>`;
            });
        });
}

function showAddPanelForm() {
    document.getElementById('add-panel-form').style.display = 'block';
    document.getElementById('edit-panel-form').style.display = 'none';
}

function showAddInverterForm() {
    document.getElementById('add-inverter-form').style.display = 'block';
    document.getElementById('edit-inverter-form').style.display = 'none';
}

function showEditPanelForm(id, brand, price, power) {
    document.getElementById('edit-panel-id').value = id;
    document.getElementById('edit-panel-brand').value = brand;
    document.getElementById('edit-panel-price').value = price;
    document.getElementById('edit-panel-power').value = power;
    document.getElementById('edit-panel-form').style.display = 'block';
    document.getElementById('add-panel-form').style.display = 'none';
}

function showEditInverterForm(id, brand, price, power) {
    document.getElementById('edit-inverter-id').value = id;
    document.getElementById('edit-inverter-brand').value = brand;
    document.getElementById('edit-inverter-price').value = price;
    document.getElementById('edit-inverter-power').value = power;
    document.getElementById('edit-inverter-form').style.display = 'block';
    document.getElementById('add-inverter-form').style.display = 'none';
}

function addPanel() {
    const brand = document.getElementById('panel-brand').value;
    const price = document.getElementById('panel-price').value;
    const power = document.getElementById('panel-power').value;
    
    fetch('/api/panels/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ brand, price, power, availability: true })
    }).then(response => response.json())
    .then(data => {
        alert('Panel added successfully!');
        fetchPanels();
        document.getElementById('add-panel-form').style.display = 'none';
    });
}

function addInverter() {
    const brand = document.getElementById('inverter-brand').value;
    const price = document.getElementById('inverter-price').value;
    const power = document.getElementById('inverter-power').value;
    
    fetch('/api/inverters/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ brand, price, power, availability: true })
    }).then(response => response.json())
    .then(data => {
        alert('Inverter added successfully!');
        fetchInverters();
        document.getElementById('add-inverter-form').style.display = 'none';
    });
}

function updatePanel() {
    const id = document.getElementById('edit-panel-id').value;
    const brand = document.getElementById('edit-panel-brand').value;
    const price = document.getElementById('edit-panel-price').value;
    const power = document.getElementById('edit-panel-power').value;

    fetch(`/api/panels/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ brand, price, power, availability: true })
    }).then(response => response.json())
    .then(data => {
        alert('Panel updated successfully!');
        fetchPanels();
        document.getElementById('edit-panel-form').style.display = 'none';
    });
}

function updateInverter() {
    const id = document.getElementById('edit-inverter-id').value;
    const brand = document.getElementById('edit-inverter-brand').value;
    const price = document.getElementById('edit-inverter-price').value;
    const power = document.getElementById('edit-inverter-power').value;

    fetch(`/api/inverters/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ brand, price, power, availability: true })
    }).then(response => response.json())
    .then(data => {
        alert('Inverter updated successfully!');
        fetchInverters();
        document.getElementById('edit-inverter-form').style.display = 'none';
    });
}

function deletePanel(id) {
    fetch(`/api/panels/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }).then(response => response.json())
    .then(data => {
        alert('Panel deleted successfully!');
        fetchPanels();
    });
}

function deleteInverter(id) {
    fetch(`/api/inverters/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }
    }).then(response => response.json())
    .then(data => {
        alert('Inverter deleted successfully!');
        fetchInverters();
    });
}

function setPrices() {
    const customCost = document.getElementById('custom-cost').value;
    const absCost = document.getElementById('abs-cost').value;
    const pricePerWatt = document.getElementById('price-per-watt') ? document.getElementById('price-per-watt').value : customCost;
    const installationCost = document.getElementById('installation-cost').value;
    const dcRoll = document.getElementById('dc-cable-cost').value;
    const acCable = document.getElementById('ac-cable-cost').value;
    const transport = document.getElementById('transport-cost').value;
    const accessories = document.getElementById('accessories-cost').value;
    const labor = document.getElementById('labor-cost').value;
    const l2Value = document.getElementById('l2-select').value;
    const l2 = (l2Value === 'True');
    const netMetering = document.getElementById('net-metering').value;

    fetch('/api/set-prices/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            pricePerWatt,
            installationCost,
            netMetering,
            dcRoll,
            acCable,
            transport,
            accessories,
            labor,
            l2,
            customCost,
            absCost
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Prices set successfully!');
    })
    .catch(error => {
        alert('Error setting prices: ' + error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchPrices();
});

function fetchPrices() {
    fetch('/api/get-prices/')
        .then(response => response.json())
        .then(data => {
            // Frame costs
            document.getElementById('custom-cost').value = data.custom_frame_cost_per_watt || '';
            document.getElementById('abs-cost').value = data.abs_frame_cost_per_watt || '';

            // Other variable costs
            document.getElementById('installation-cost').value = data.installation_cost_per_watt || '';
            document.getElementById('dc-cable-cost').value = data.dc_roll_cost || '';
            document.getElementById('ac-cable-cost').value = data.ac_wire_cost || '';
            document.getElementById('transport-cost').value = data.transport_cost || '';
            document.getElementById('accessories-cost').value = data.accessories_cost || '';
            document.getElementById('labor-cost').value = data.labour_cost || '';

            // Net metering
            document.getElementById('net-metering').value = data.net_metering || '';

            // L2 flag (True/False)
            if (data.l2 !== undefined) {
                document.getElementById('l2-select').value = data.l2 ? 'True' : 'False';
            }
        })
        .catch(error => {
            console.error('Error fetching prices:', error);
        });
}