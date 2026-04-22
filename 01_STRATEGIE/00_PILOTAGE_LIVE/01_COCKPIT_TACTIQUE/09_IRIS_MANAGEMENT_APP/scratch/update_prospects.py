import os
import re

dir_path = "/Users/hachicha/Desktop/digital flux/02_POLES/NOS_AGENTS_D_ELITE/02_POLE_COMMERCIAL_SALES/02_CRM_SOUVERAIN/PROSPECTS/"
files = [f for f in os.listdir(dir_path) if f.endswith(".md")]

for filename in files:
    if filename in ["Dr_Fares_Mbarek.md", "Dr_Walid_Meddeb.md"]:
        continue # Already updated
        
    filepath = os.path.join(dir_path, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already has website_url
    if "website_url:" in content:
        continue
        
    # Inject before sales_hook or source
    new_fields = "website_url: NONE\nsite_status: ABSENT\n"
    
    if "sales_hook:" in content:
        content = content.replace("sales_hook:", new_fields + "sales_hook:")
    elif "source:" in content:
        content = content.replace("source:", new_fields + "source:")
    else:
        # Fallback: inject before the last --- of frontmatter
        parts = content.split("---")
        if len(parts) >= 3:
            parts[1] = parts[1] + new_fields
            content = "---".join(parts)
            
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Updated {filename}")
