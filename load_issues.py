import json
import subprocess
import time
import os

def create_issues():
    json_path = 'issues/ui-issues-complete.json'
    if not os.path.exists(json_path):
        print(f"Error: File not found at {json_path}")
        return

    with open(json_path, 'r') as f:
        issues = json.load(f)

    print(f"Found {len(issues)} issues to create.")

    # 1. Collect and create all labels first
    all_labels = set()
    for issue in issues:
        all_labels.update(issue.get('labels', []))
    
    print(f"Ensuring {len(all_labels)} labels exist: {all_labels}")
    for label in all_labels:
        # Try to create label, ignore if it already exists
        subprocess.run(['gh', 'label', 'create', label], capture_output=True)

    # 2. Create issues
    for i, issue in enumerate(issues, 1):
        title = issue['title']
        body = issue['body']
        labels = issue['labels']
        
        # Construct label arguments
        label_args = []
        for label in labels:
            label_args.extend(['--label', label])
        
        cmd = [
            'gh', 'issue', 'create',
            '--title', title,
            '--body', body,
        ] + label_args
        
        print(f"[{i}/{len(issues)}] Creating issue: {title}")
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"Success: {result.stdout.strip()}")
            time.sleep(2) # Sleep to avoid hitting rate limits too hard
        except subprocess.CalledProcessError as e:
            print(f"Failed to create issue '{title}': {e.stderr}")

if __name__ == '__main__':
    create_issues()
