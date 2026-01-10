# Website Updates for ACL 2026 Paper

## Overview
Updated the website for the ACL 2026 paper: "Preference Optimization for Review Question Generation Improves Writing Quality"

## Key Changes Made

### 1. Title and Metadata
- Updated page title from "IntelliAsk: Learning to Ask Critical Questions with Human-Aligned Rewards" to "Preference Optimization for Review Question Generation Improves Writing Quality"
- Updated meta description to reflect the paper's focus on improving writing quality through preference optimization
- Added keywords: IntelliReward, Reinforcement Learning, DAPO

### 2. Header Section
- Updated main title to match the paper
- Added code repository link (https://anonymous.4open.science/r/IntelliA-3E09/)
- Added placeholder for paper PDF link

### 3. Abstract
- Completely rewrote abstract to match the paper's content
- Highlighted key results: MuSR (68.3 vs 64.7), WritingBench (8.31 vs 8.07)
- Emphasized the novel IntelliReward architecture with frozen LLM and trainable multi-head transformers
- Focused on DAPO training approach

### 4. Content Sections

#### Question Extraction and Curation
- Explained the data collection from ICLR 2024 (151k → 15.5k questions)
- Detailed the multi-stage filtering process
- Added information about question placement variability

#### Human Preference Annotation Study
- Added details about 572 annotated question-paper pairs
- Explained the three evaluation dimensions: Effort, Evidence, Grounding
- Highlighted key finding: humans scored 0.78-1.53 points higher than models

#### IntelliReward: Reward Model Architecture
- Detailed the architecture: frozen gpt-oss-20b with trainable Transformer heads
- Explained pooling of last 50 token states
- Highlighted 72% mean accuracy vs 32-53% for API-based baselines
- Emphasized efficiency: 30 minutes training, 300MB VRAM inference

#### IntelliAsk: Training with Human-Aligned Rewards
- Explained why SFT fails (0.03-0.10/3.0 scores)
- Described DAPO (7B) and GRPO (32B) training approaches
- Highlighted results: 0.55/3.0 (automatic), 0.66/3.0 (human eval)
- Emphasized lowest first-page bias (21.37%)

#### Evaluation Results
- **Question Generation Performance:**
  - IntelliAsk-32B: 0.55/3.0 vs Qwen3-32B: 0.28/3.0
  - Outperforms OpenReviewer, DeepReviewer (0.10/3.0)
  - Competitive with o3 (0.72/3.0)

- **Generalization to Writing/Reasoning:**
  - WritingBench: 8.31 vs 8.07
  - Arena Hard: 94.1 vs 93.8
  - MuSR: 68.3% vs 64.7%
  - DROP: 95.1 vs 93.3 F1
  - GPQA-Diamond: 69.1% vs 68.4%

#### Related Work
- Updated to reflect the paper's positioning
- Emphasized the gap in focusing on question generation itself
- Highlighted limitations of SFT and LLM-as-judge approaches

### 5. Carousel Updates
- Updated with 8 key figures showing:
  1. System architecture
  2. IntelliReward architecture
  3. Data curation pipeline
  4. Filtering statistics
  5. Score distributions
  6. SFT vs RL training curves
  7. Reward model-human alignment
  8. Preference comparison study
- Added descriptive captions for each image
- Added CSS styling for carousel captions

### 6. BibTeX Citation
- Updated citation with correct paper title
- Changed from @article to @inproceedings
- Added ACL 2026 as booktitle
- Included code repository URL

### 7. Visual Assets
All required images are present in `/static/images/intelliask/`:
- architecture.png
- reward_model.png
- data_curation.png
- waterfall.png
- score_graph.png
- sft_vs_rl.png
- IntellirewardAndHumanAlign.png
- IntelliAskvsOthersPreferences.png

## Key Highlights of the Website

### Main Contributions Clearly Presented:
1. **IntelliReward**: Novel reward model with 72% accuracy
2. **IntelliAsk**: RL-trained model achieving 0.66/3.0 in human eval
3. **Generalization**: Improvements on reasoning and writing benchmarks
4. **Human Preference Data**: 572 expert-annotated question-paper pairs

### Strong Results Emphasized:
- Human questions score 0.78+ points higher than best LLM
- IntelliAsk outperforms SFT baselines by 5-6x
- Lowest first-page bias among all models (21.37%)
- Consistent gains across external benchmarks

### Clear Narrative:
1. Problem: LLMs generate surface-level questions
2. Approach: Human preference data → IntelliReward → RL training
3. Results: Better questions + improved writing/reasoning
4. Insight: Question quality correlates with broader capabilities

## Files Modified
1. `/index.html` - Main website content
2. `/static/css/index.css` - Styling for carousel captions
3. `/WEBSITE_UPDATES.md` - This documentation file

## Next Steps
1. Add PDF link when paper is published
2. Consider adding an interactive demo if desired
3. Update author names when de-anonymizing
4. Add institution affiliations when ready
5. Consider adding video walkthrough or presentation slides

## Testing
To view the website locally:
```bash
cd /home/vidusheevats/Documents/intelliask.github.io
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## Notes
- Website maintains clean, professional academic style
- All content derived directly from the latex paper
- Emphasis on reproducibility (code link provided)
- Mobile-responsive design using Bulma CSS framework
