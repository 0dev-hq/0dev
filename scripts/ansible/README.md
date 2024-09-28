ansible/
├── ansible.cfg                # Ansible configuration file
├── inventory.ini              # Inventory file with the server details
├── playbook.yml               # Main playbook to run the tasks
├── roles/
│   ├── setup/
│   │   └── tasks/
│   │       └── main.yml       # Task to install pm2 and configure Apache
│   ├── deploy/
│   │   └── tasks/
│   │       └── main.yml       # Task to deploy the API (blue/green)
│   ├── switch/
│   │   └── tasks/
│   │       └── main.yml       # Task to switch blue/green based on the last deployment
└── templates/
    └── apache_blue_green.j2   # Apache configuration template
