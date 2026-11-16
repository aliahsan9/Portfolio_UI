# Why the Next Token Is Rarely the Original One

![Cover image for the essay on why language models repeat themselves](assets/blogs/images/ai-uniqueness.avif)

I can get a fluent paragraph about a slow API in a few seconds. I have. It names a cache, then an index, then pagination, in that order of confidence. Those are real causes of slow reads. They are also the causes a tutorial is likely to name, which is a different fact from them being the cause in a given codebase.

In the school system I overbuilt, a student list crossed a controller, an application service, a CQRS handler, a specification, a repository, a tenant resolver, and a mapper before it touched a row. I wrote that failure up in [the overengineering post](https://aliahsan.tech/blog/over-engineering). The chain is not a secret. It is uncommon, and uncommon is what next-token training is built to treat as unlikely until the chain is sitting in the prompt.

This is the mechanism, the measurements I could check, and the part I can change when I sit down to write. The six-token distributions below are constructed. I picked the logits so the arithmetic is visible on a page. Every percentage is the softmax of those logits, and the program at the end recomputes them.

## A letter of English is mostly decided already

In 1951 Claude Shannon published the estimate that still organizes this subject. If you only look eight letters back, printed English carries about 2.3 bits per letter, roughly 50% redundancy. Once the predictor may look as far as a hundred characters, the entropy falls to something on the order of one bit per letter, and the redundancy to roughly 75% ([Prediction and Entropy of Printed English](https://www.nokia.com/bell-labs/publications-and-media/publications/prediction-and-entropy-of-printed-english/), Bell System Technical Journal, 1951).

The ceiling he was measuring against is a 27-symbol alphabet, the letters plus a space. If those symbols were equiprobable, each would carry log2(27) = 4.75 bits. Half of 4.75 is 2.38, close to his eight-letter estimate of 2.3. A quarter of 4.75 is 1.19, close to the one bit he estimated for long context. The redundancy figures are that subtraction.

People doing the predicting in his experiment were already good at it. A language model is a machine built to do the same job at the scale of a corpus: assign high probability to the continuation that usually comes next. The original sentence, the one that was not the usual continuation, lives in the bit he said was left, not in the 75% the statistics had already spent.

Margaret Boden's distinction is the right one for what happens after you read the sample. A sentence can be new to the person who requested it and still be the most probable sentence in the model. She called the first psychological creativity and the second historical creativity (*The Creative Mind*, 2nd ed., Routledge, 2004). The product page of a chat tool is graded on the first. The training loss is graded on neither. It is graded on likelihood.

## The model hands you one draw from a list

An autoregressive model factors a document into one-step predictions:

```text
p(x) = p(x_1) p(x_2 | x_1) p(x_3 | x_1 x_2) ...
```

Training minimizes the average of `-log p(x_t | x_<t)` over tokens in the corpus. A continuation that appears in a thousand tutorials contributes to that average a thousand times. A continuation that appeared in one incident contributes once. The weights move toward the first.

At generation time the network does not emit a sentence. It emits a logit, a real number, for every token in the vocabulary. Temperature `T` divides those logits, and softmax turns them into probabilities:

```text
p_i = exp(z_i / T) / sum_j exp(z_j / T)
```

![Context produces logits, temperature rescales them, softmax makes a distribution, and one sampled token is appended.](assets/blogs/images/ai-token-loop.svg)

*Figure 1. The loop that writes the paragraph. The loss during training is the average negative log probability of the token that was actually next.*

One fact falls out of the formula before any sampling trick does. If `z_i > z_j` and `T > 0`, then `z_i / T > z_j / T`. The most likely token is the same token at every positive temperature. `T` changes the entropy. It does not hold an election.

Here is the toy, with logits I chose: caching 4.0, indexing 3.1, pagination 2.2, N+1 1.1, tenant 0.3, layers -0.8. Read them as six candidates for the next word after "the read was slow because of." Caching stands in for the tutorial answer. Layers stands in for the chain in that school system.

| Token | T = 0.3 | T = 1 | T = 1.8 |
|---|---:|---:|---:|
| caching | 95.03% | 60.25% | 42.17% |
| indexing | 4.73% | 24.49% | 25.57% |
| pagination | 0.24% | 9.96% | 15.51% |
| N+1 | 0.01% | 3.31% | 8.42% |
| tenant | 0.00% | 1.49% | 5.40% |
| layers | 0.00% | 0.50% | 2.93% |
| Entropy | 0.30 bits | 1.56 bits | 2.12 bits |

Six equally likely tokens would have entropy log2(6) = 2.58 bits. At T = 1.8 the distribution has moved toward that, and caching is still first. Layers has gone from a 1-in-200 draw to a 1-in-34 draw. Every other unlikely token was lifted by the same division.

![Bar charts of the six-token toy at temperatures 0.3, 1, and 1.8. The mode remains caching.](assets/blogs/images/ai-temperature.svg)

*Figure 2. Blue is the mode at every temperature. At T = 1 the nucleus p = 0.9 closes after pagination.*

## The maximum is a bland sentence

[Holtzman, Buys, Du, Forbes, and Choi](https://arxiv.org/abs/1904.09751) (ICLR 2020) showed why taking the maximum is the wrong objective for open-ended text. Beam search, which hunts the high-probability continuation, produces sentences that are grammatical and then loop. Sampling from the whole distribution does the opposite: the vocabulary has a long tail of tokens whose individual probabilities are tiny and whose total mass is not, and a lot of that tail is junk. They called it the unreliable tail.

Nucleus sampling, their top-p, keeps the smallest set of tokens whose probabilities sum to at least `p`, drops the rest, and renormalizes:

```text
V(p) = smallest set with sum_{x in V(p)} p(x) >= p
p'(x) = p(x) / sum_{V(p)} p    if x is in V(p), else 0
```

On the toy at T = 1 and p = 0.9, the set closes after three tokens. Caching, indexing, and pagination hold 94.7% of the mass. N+1, tenant, and layers are outside the nucleus. A decoder with those settings cannot say "layers" at all. That is the point of the truncation: it refuses the unreliable tail. It also refuses anything you were hoping lived out there.

So the two popular knobs pull in directions Holtzman already separated. Lower T, or a small nucleus, concentrates the draw on the mode and the near-mode. Higher T lets the tail in, junk included. Neither knob writes a new logit for the token that would have named your incident.

## Preference tuning multiplies the answer raters already like

The models people actually call have been through a second training stage. [Ouyang et al.](https://arxiv.org/abs/2203.02155) (2022) describe the pipeline used for InstructGPT: supervised fine-tuning on demonstrations, a reward model trained on human comparisons, then a policy optimized to score well on that reward model while staying close to the supervised model in KL divergence. The objective rewards the answer a rater prefers, and it charges a penalty for drifting from the reference.

The optimum of that constrained objective has a closed form. [Rafailov et al.](https://arxiv.org/abs/2305.18290) write it as equation 4, following the same KL-regularized objective used since the earlier preference-tuning work:

```text
pi*(y | x) = pi_ref(y | x) * exp(r(x, y) / beta) / Z(x)
```

`Z(x)` renormalizes. `beta` is the price of moving away from the reference. The update multiplies the reference probability by an exponential of the reward. Tokens a rater scores highly grow. Tokens a rater scores poorly shrink by orders of magnitude, and the shrinkage is worse for tokens that were already rare, because the multiply happens before the renormalization.

I assigned sketch rewards, far enough apart to see the tilt on one figure: caching 1.8, indexing 1.5, pagination 1.1, N+1 0.4, tenant -0.4, layers -1.2, with beta = 0.5. A trained reward model is a network, and its scores are smoother than this. The functional form is the part that is not optional.

| Token | Reference | After the tilt |
|---|---:|---:|
| caching | 60.25% | 78.89% |
| indexing | 24.49% | 17.60% |
| pagination | 9.96% | 3.22% |
| N+1 | 3.31% | 0.26% |
| tenant | 1.49% | 0.0239% |
| layers | 0.50% | 0.0016% |
| Entropy | 1.56 bits | 0.90 bits |

Layers got about 300 times smaller. The entropy fell by 0.66 bits. That is the same distribution, tilted toward the answer the reward called good.

![The reference distribution beside the exponentially tilted distribution. Caching grows. The tail collapses.](assets/blogs/images/ai-preference-tilt.svg)

*Figure 3. Both columns use the same scale, 2.4 pixels per percentage point. A bar that would come out under a pixel is drawn at 3 pixels so the row stays visible. The rewards are the sketch in the table, not a fitted reward model.*

[Kirk, Mediratta, Nalmpantis, Luketina, Hambro, Grefenstette, and Raileanu](https://arxiv.org/abs/2310.06452) (ICLR 2024) measured what this does to samples. On summarization, RLHF cut per-input diversity hard relative to supervised fine-tuning, on expectation-adjusted distinct n-grams and on sentence-BERT distance. The drop across different inputs was smaller. A third metric, built from an entailment model, did not separate the policies: the summaries were not becoming logically contradictory or redundant in a way that metric could see. On their instruction-following models the diversity metrics were inconclusive, which they attribute to outputs that are long and to RLHF making them longer. The honest summary is narrower than "RLHF always collapses chat." For a fixed prompt, on the task where the metrics were built to work, the tuned policy repeats itself more than the supervised one.

There is a second, sharper comparison. [Padmakumar and He](https://arxiv.org/abs/2309.05196) (ICLR 2024) had 38 writers produce argumentative essays alone, with GPT-3, and with InstructGPT: 100 essays in each condition, 10 topics. InstructGPT reduced lexical and content diversity. GPT-3, at a similar share of model-written text, did not. The key-point homogenization score (ROUGE-L) was 0.154 alone, 0.158 with GPT-3, and 0.166 with InstructGPT, with the InstructGPT difference significant at p < 0.05. The reduction sat in the sentences the model inserted. The sentences the writers wrote themselves stayed about as diverse as before. Preference tuning, not "a language model" as such, was the thing that narrowed the page.

## One writer improves. The set of writers converges.

Three experiments asked what happens when a person is the one holding the pen.

[Doshi and Hauser](https://www.science.org/doi/10.1126/sciadv.adn5290) (Science Advances, 2024) recruited 293 writers and 600 independent evaluators. Each writer produced an eight-sentence story. Some could request up to one three-sentence idea from GPT-4, some up to five, some none. With access to five ideas, evaluators scored novelty 8.1% higher (b = 0.311, p < 0.001) and usefulness 9.0% higher (b = 0.453, p < 0.001) than stories written with no model. The gain was concentrated in writers who scored lower on a divergent-association pretest. Writers who already scored high barely moved.

The stories also moved toward each other. On a 0–100 rescaling of cosine similarity between embeddings, access to one idea shifted a story 0.87 points toward the average story in its condition (p < 0.001), and five ideas shifted it 0.72 points (p = 0.003). Human-only scores on that measure only spanned 8.10 points, so those shifts are about a tenth of the range the unaided writers actually occupied. Stories written from a model idea were also about 5% more similar to the idea itself than unaided stories were to a randomly assigned idea from the same topic (the unaided mean sat at 82.85 on the same 0–100 scale). Their constraint is part of the result: eight sentences, ideas fetched up front, no revision loop. Within that task, the individual score went up and the spread went down.

[Anderson, Shah, and Kreminski](https://doi.org/10.1145/3635636.3656204) (Creativity and Cognition, 2024) ran a within-subjects study with 36 participants, ChatGPT against the Oblique Strategies deck of Brian Eno and Peter Schmidt. ChatGPT produced more ideas (8.39 versus 7.32, p = 0.044) and the ideas covered more categories (8.58 versus 6.77, about 27% more, p = 0.001). The count of ideas that nobody else in the study wrote did not rise. At group level, ideas sat closer to the centroid of all ideas for the task: their divergence score was 0.24 with ChatGPT and 0.28 with the deck (t(32) = 2.15, p = 0.038, d = 0.47). Inside one person's own list, the same comparison did not move (p = 0.35). Participants also assigned themselves less of the credit, 48% of the responsibility with ChatGPT against 64% with the deck (p = 0.003).

The deck is a pile of constraints that do not answer the prompt ("Turn it upside down"). The authors' reading, which matches the numbers, is that a finished paragraph has a short interpretive step, so the person's own associations have less room to enter. An oblique constraint has a long one. Fluency went up. Ideas that were unique inside the room did not.

Put Padmakumar next to these and the mechanism is consistent. The base model, sampled without the preference stage dominating the prose, did not homogenize the essays. The preference-tuned model did, and it did so by contributing the repeated sentences. The human subjects then experience that as a nicer draft and a room full of similar drafts.

## The next model trains on the narrower text

[Shumailov, Shumaylov, Zhao, Papernot, Anderson, and Gal](https://doi.org/10.1038/s41586-024-07566-y) (Nature, 2024) asked what happens when that narrower text becomes the next training set. They call the failure model collapse. Early in the process the model loses the tails of the original distribution. Later it converges to something with very small variance that no longer resembles the original.

They separate three errors, and the first is enough. Statistical error: a finite sample misses events. If a token has probability `q` at or below `1/M` in a sample of size `M`, the expected count of that token is below one. Fit the next model to the sample and the missing event has nowhere to come back from. They show that even with a perfect fit, no approximation error at all, this sampling process on a discrete distribution is a Markov chain whose absorbing states are point masses. It reaches one of them with probability 1. In the Gaussian case the variance goes to zero and the Wasserstein-2 distance from the original distribution diverges, again with probability 1. Approximation error and limited model expressivity make it worse. They are not required for the collapse.

![Schematic histograms: a long tail, then the tail gone, then a single spike, plus the mixing formula for the next training set.](assets/blogs/images/ai-model-collapse.svg)

*Figure 4. A schematic of early and late collapse as they define them. The bar heights are not a trace from their paper.*

The language experiment is a fine-tune, which is the setting they could afford and also the setting a practitioner is in. They took OPT-125m, fine-tuned it on WikiText-2, and reached a mean perplexity of 34 against a zero-shot baseline of 115. Each generation, the current model produced a fresh corpus by 5-way beam search, predicting the next 64 tokens of every block, and the next fine-tune started again from the original pretrained checkpoint. With none of the original WikiText-2 retained, they report a degradation on the order of 20 to 28 perplexity points. With a random 10% of the original data kept in each generation, the degradation stayed minor.

Beam search is the most mode-seeking decoder they could have used, so that run is a harsh case. The theorem does not depend on it. Finite sampling deletes rare events under any decoder that samples. The 10% figure is the practical one. A fine-tune that is fed only the model's own outputs is the gamma = 0 regime. Keeping a slice of text that was not produced by the model is the regime that held.

## Change the logits, then measure the set

Temperature is the edit I see people reach for, and Figure 2 is why I stopped treating it as a creativity control. The penalty parameters are the next edit, and they are also not a search for the tail.

The [OpenAI text-generation guide](https://developers.openai.com/api/docs/guides/advanced-usage) documents frequency and presence penalties as additive shifts on the logits, before softmax. If `c[j]` is how often token `j` has already been sampled:

```text
mu[j] = mu[j] - c[j] * frequency_penalty - (c[j] > 0 ? presence_penalty : 0)
```

Both coefficients are defined on [-2, 2]. The guide's practical range for a light touch is about 0.1 to 1. On the toy, suppose caching has already been said once, frequency penalty is 0.8, and presence penalty is 0.4. The caching logit falls from 4.0 to 2.8. Indexing, which was 3.1, becomes the mode at 42.31%. Caching drops to 31.34%. Layers moves from 0.50% to 0.86%. The penalty dethroned a repeated token and crowned the runner-up. The runner-up was the second most generic answer.

The edit that changes the mode is a change to the logits themselves. A more specific prompt is that edit. The right-hand column of the next figure uses a second set of logits I chose to represent the same six candidates after the prompt contains the request path from the school system: layers 3.4, tenant 2.6, N+1 1.8, indexing 1.4, pagination 0.6, caching 1.0. At T = 1, layers is now 51.60% and caching is 4.68%. I am not claiming a production model moves by exactly these amounts. I am claiming the direction. New evidence in the context replaces `z`. Temperature rescales whatever `z` you already had.

![Three interventions side by side: higher temperature, a repetition penalty, and a prompt that contains the specific fact.](assets/blogs/images/ai-move-the-mode.svg)

*Figure 5. The left card and the middle card start from the original logits. The right card is a different logit vector. Only the right card makes layers the mode.*

When I want a different answer out of an API, the order is:

1. Write the uncommon fact into the prompt before asking for a cause. In this codebase that fact is the chain of types the request crosses, and a number if I have one. "Make it more creative" leaves `z` where the corpus put it.
2. Leave temperature at 1 and the nucleus near 0.9 unless I am deliberately sampling alternatives I will read myself. If I raise them, I read the tail. I do not publish it raw.
3. Use a presence penalty around 0.3 to 0.6 when a draft is repeating a phrase. Check the formula above against what I am hoping it will do. It will suppress a token already on the page. It will not go find the incident.
4. If I am the one fine-tuning, keep a real fraction of human-written tokens in the mix. Shumailov's 10% is an existence proof from a 125-million-parameter fine-tune, not a universal constant, and it is the right order of magnitude to take seriously. The beta in the preference objective is the diversity knob on the closed form: smaller beta, sharper tilt, less of the reference tail.

Then I measure the set, because a single sample that I happen to like is an anecdote.

[Li, Galley, Brockett, Gao, and Dolan](https://aclanthology.org/N16-1014/) (NAACL 2016) defined the lexical version that is still worth computing. distinct-2 is the number of unique bigrams divided by the number of bigrams, over the samples you are comparing. Kirk and colleagues drew 16 completions per prompt when they scored per-input diversity. That is a reasonable N for a check, and it is not a law.

distinct-2 misses paraphrases. "Add a cache in front of the attendance query" and "add an index in front of the attendance query" share five of their eight bigrams each, so the pooled distinct-2 is 11/16 = 0.688. The sentences look like two answers. They are one answer with a noun swapped, and 0.688 flatters them.

The metric the human-subject papers used for that case is geometric. Embed each completion, average the vectors to a centroid, and score each completion by its cosine distance to that centroid. Doshi and Hauser used OpenAI's embeddings. Anderson, Shah, and Kreminski used the `all-MiniLM-L6-v2` sentence transformer and, usefully, checked it against their own human categorization before trusting it. Kirk used Sentence-BERT. Cosine is the dot product divided by the product of the Euclidean norms. Distance to the centroid is 1 minus that cosine, if you want a number that rises when the samples spread out. If that number does not move when you change the prompt, the edit did not move the distribution you care about, whatever distinct-2 says.

## A program that recomputes the tables

This is a .NET 8 console program with implicit usings. It recomputes Figure 2, the tilt in Figure 3, the penalty and the conditioned prompt in Figure 5, and the distinct-2 of the two near-paraphrases. The rewards and the second logit vector are the sketches from the article, written down in one place so they cannot drift from the prose.

```csharp
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

var tokens = new[] { "caching", "indexing", "pagination", "N+1", "tenant", "layers" };
var logits = new[] { 4.0, 3.1, 2.2, 1.1, 0.3, -0.8 };
var rewards = new[] { 1.8, 1.5, 1.1, 0.4, -0.4, -1.2 };
var conditioned = new[] { 1.0, 1.4, 0.6, 1.8, 2.6, 3.4 };

Console.WriteLine("token         T=0.3     T=1      T=1.8");
foreach (var i in Enumerable.Range(0, tokens.Length))
{
    var cells = new[] { 0.3, 1.0, 1.8 }
        .Select(t => Softmax(logits, t)[i].ToString("0.00%", CultureInfo.InvariantCulture));
    Console.WriteLine($"{tokens[i],-12} {string.Join("  ", cells)}");
}

PrintEntropy("T=0.3", Softmax(logits, 0.3));
PrintEntropy("T=1", Softmax(logits, 1));
PrintEntropy("T=1.8", Softmax(logits, 1.8));

var reference = Softmax(logits, 1);
var nucleus = Nucleus(reference, 0.9);
Console.WriteLine("nucleus p=0.9: " + string.Join(", ", nucleus.Select(i => tokens[i])));

var tilted = Tilt(reference, rewards, beta: 0.5);
Console.WriteLine("tilt beta=0.5");
PrintPair(reference, tilted);

var penalizedLogits = (double[])logits.Clone();
penalizedLogits[0] -= 1 * 0.8 + 0.4;
var penalized = Softmax(penalizedLogits, 1);
Console.WriteLine("penalty on caching, then T=1");
PrintPair(reference, penalized);

var prompted = Softmax(conditioned, 1);
Console.WriteLine("conditioned prompt, T=1, mode " + tokens[ArgMax(prompted)]);
PrintPair(reference, prompted);

var samples = new[]
{
    "add a cache in front of the attendance query",
    "add an index in front of the attendance query"
};
Console.WriteLine($"distinct-2 = {Distinct2(samples).ToString("0.000", CultureInfo.InvariantCulture)}");

static double[] Softmax(double[] logits, double temperature)
{
    if (temperature <= 0)
        throw new ArgumentOutOfRangeException(nameof(temperature), "T has to be positive.");

    var shift = logits.Max() / temperature;
    var weights = new double[logits.Length];
    var sum = 0.0;
    for (var i = 0; i < logits.Length; i++)
    {
        weights[i] = Math.Exp(logits[i] / temperature - shift);
        sum += weights[i];
    }

    for (var i = 0; i < weights.Length; i++)
        weights[i] /= sum;

    return weights;
}

static double[] Tilt(double[] reference, double[] rewards, double beta)
{
    var weights = new double[reference.Length];
    var sum = 0.0;
    for (var i = 0; i < reference.Length; i++)
    {
        weights[i] = reference[i] * Math.Exp(rewards[i] / beta);
        sum += weights[i];
    }

    for (var i = 0; i < weights.Length; i++)
        weights[i] /= sum;

    return weights;
}

static List<int> Nucleus(double[] probabilities, double p)
{
    var chosen = new List<int>();
    var mass = 0.0;
    foreach (var i in Enumerable.Range(0, probabilities.Length).OrderByDescending(i => probabilities[i]))
    {
        chosen.Add(i);
        mass += probabilities[i];
        if (mass >= p)
            break;
    }

    return chosen;
}

static double Distinct2(IEnumerable<string> samples)
{
    var unique = new HashSet<string>(StringComparer.Ordinal);
    var total = 0;
    foreach (var sample in samples)
    {
        var parts = sample.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        for (var i = 0; i < parts.Length - 1; i++)
        {
            unique.Add(parts[i] + "\u001f" + parts[i + 1]);
            total++;
        }
    }

    return total == 0 ? 0 : (double)unique.Count / total;
}

static double Entropy(double[] probabilities) =>
    -probabilities.Where(p => p > 0).Sum(p => p * Math.Log2(p));

static int ArgMax(double[] values)
{
    var best = 0;
    for (var i = 1; i < values.Length; i++)
        if (values[i] > values[best])
            best = i;
    return best;
}

static void PrintEntropy(string label, double[] probabilities) =>
    Console.WriteLine($"{label} entropy {Entropy(probabilities).ToString("0.00", CultureInfo.InvariantCulture)} bits");

static string Pct(double probability) =>
    (probability >= 0.001 ? probability.ToString("0.00%", CultureInfo.InvariantCulture)
                          : probability.ToString("0.0000%", CultureInfo.InvariantCulture));

static void PrintPair(double[] before, double[] after)
{
    for (var i = 0; i < before.Length; i++)
        Console.WriteLine($"  {Pct(before[i])} -> {Pct(after[i])}");
}
```

`ToString("0.00%")` multiplies by 100. Values under 0.1% use four decimal places so the tilted tail does not print as zero. The centroid check is separate, because it needs vectors from an embedding model. Paste the next two functions beside the program. Nothing in the program calls them.

This is the distance I compare across prompts:

```csharp
static double CosineDistanceToCentroid(IReadOnlyList<double[]> vectors)
{
    var dim = vectors[0].Length;
    var centroid = new double[dim];
    foreach (var vector in vectors)
        for (var i = 0; i < dim; i++)
            centroid[i] += vector[i] / vectors.Count;

    var distance = 0.0;
    foreach (var vector in vectors)
        distance += 1 - Cosine(vector, centroid);

    return distance / vectors.Count;
}

static double Cosine(double[] a, double[] b)
{
    double dot = 0, na = 0, nb = 0;
    for (var i = 0; i < a.Length; i++)
    {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }

    var denom = Math.Sqrt(na) * Math.Sqrt(nb);
    return denom == 0 ? 0 : dot / denom;
}
```

Sixteen completions, one prompt, two versions of the prompt. If the mean cosine distance to the centroid does not rise, I have not made the set more diverse. I have made one sample that I preferred.

## What I do with this on a real post

I write the incident first, in sentences that contain the boring specific nouns. For the school system those nouns are the types in the request path, and the fact that I was building it for a few hundred users while designing for a platform I did not have. A model is bad at inventing that and perfectly good at smoothing a sentence once the nouns are mine.

I will let it cut a clause, point at a missing transition, or produce a second phrasing I can reject. I do not ask it for the cause, and I do not ask it for the opinion. Both requests return the mode. When a draft starts to share its bigrams with the last three things I have seen on the same topic, that is the measurement, done informally: the nucleus has closed, and I am the one who has to put a new fact on the page before the next token is worth reading.

## References

- Shannon, C. E. (1951). Prediction and Entropy of Printed English. *Bell System Technical Journal*, 30(1), 50–64. [Bell Labs record](https://www.nokia.com/bell-labs/publications-and-media/publications/prediction-and-entropy-of-printed-english/).
- Boden, M. A. (2004). *The Creative Mind: Myths and Mechanisms* (2nd ed.). Routledge.
- Holtzman, A., Buys, J., Du, L., Forbes, M., and Choi, Y. (2020). The Curious Case of Neural Text Degeneration. ICLR. [arXiv:1904.09751](https://arxiv.org/abs/1904.09751).
- Li, J., Galley, M., Brockett, C., Gao, J., and Dolan, B. (2016). A Diversity-Promoting Objective Function for Neural Conversation Models. NAACL. [Anthology](https://aclanthology.org/N16-1014/).
- Ouyang, L., et al. (2022). Training language models to follow instructions with human feedback. [arXiv:2203.02155](https://arxiv.org/abs/2203.02155).
- Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., and Finn, C. (2023). Direct Preference Optimization: Your Language Model is Secretly a Reward Model. NeurIPS. [arXiv:2305.18290](https://arxiv.org/abs/2305.18290).
- Kirk, R., Mediratta, I., Nalmpantis, C., Luketina, J., Hambro, E., Grefenstette, E., and Raileanu, R. (2024). Understanding the Effects of RLHF on LLM Generalisation and Diversity. ICLR. [arXiv:2310.06452](https://arxiv.org/abs/2310.06452).
- Padmakumar, V., and He, H. (2024). Does Writing with Language Models Reduce Content Diversity? ICLR. [arXiv:2309.05196](https://arxiv.org/abs/2309.05196).
- Doshi, A. R., and Hauser, O. P. (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content. *Science Advances*, 10(28), eadn5290. [doi:10.1126/sciadv.adn5290](https://www.science.org/doi/10.1126/sciadv.adn5290).
- Anderson, B. R., Shah, J. H., and Kreminski, M. (2024). Homogenization Effects of Large Language Models on Human Creative Ideation. *Creativity and Cognition*. [doi:10.1145/3635636.3656204](https://doi.org/10.1145/3635636.3656204).
- Shumailov, I., Shumaylov, Z., Zhao, Y., Papernot, N., Anderson, R., and Gal, Y. (2024). AI models collapse when trained on recursively generated data. *Nature*, 631, 755–759. [doi:10.1038/s41586-024-07566-y](https://doi.org/10.1038/s41586-024-07566-y).
- OpenAI. Frequency and presence penalties. [Text generation guide](https://developers.openai.com/api/docs/guides/advanced-usage).

## Stay Connected

If you want the production write-ups, the JWT design and the SQL notes are the same kind of post: a mechanism, a number, and the failure that shows up after the demo works.

### Ali Ahsan

Full-Stack Developer | ASP.NET Core | Angular | SQL

[LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) | [Blogs](/blogs) | [Newsletter](/news)

Building secure, scalable, and real-world applications.
